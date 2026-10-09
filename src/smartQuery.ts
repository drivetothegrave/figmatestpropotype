// «Умный» разбор поискового запроса: из свободной фразы достаём фильтры —
// направление, период, сумму, статус, валюту и контрагента. Остаток ищем как обычный текст.
// Всё на правилах и словарях, без ИИ: мгновенно и предсказуемо.

import { MONTHS_NOM, Payment, PaymentStatus, STATUS_LABEL, TODAY_ISO, addDays, formatRub, fromIso, toIso } from './data';
import { paymentMatches } from './suggest';

export type TokenKind = 'direction' | 'period' | 'amount' | 'status' | 'currency' | 'counterparty';

export interface QueryToken {
  kind: TokenKind;
  /** Как показываем: «Входящие», «Май 2026», «от 50 000 ₽» */
  label: string;
  /** Фрагмент исходного запроса — чтобы снять фильтр, вырезав его */
  raw: string;
}

export interface ParsedQuery {
  direction?: 'in' | 'out';
  period?: { from: string; to: string };
  amount?: { min?: number; max?: number };
  status?: PaymentStatus;
  currency?: boolean;
  counterparty?: string;
  /** Что осталось после распознавания — ищем по контрагенту, назначению и комментарию */
  text: string;
  tokens: QueryToken[];
}

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');

/* ---------- Числа: «50 000», «50к», «1,5 млн», «100 тыс» ---------- */

const NUMBER = String.raw`(\d[\d\s]*(?:[.,]\d+)?)\s*(млн|миллион[а-я]*|тыс[а-я]*|т|к|k)?(?=\s|$)`;

function toNumber(value: string, unit?: string): number {
  const n = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
  if (!unit) return n;
  if (/^(млн|миллион)/.test(unit)) return n * 1_000_000;
  return n * 1_000;
}

/* ---------- Период ---------- */

const MONTH_STEMS = ['январ', 'феврал', 'март', 'апрел', 'ма[йяе]', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];

const monthRange = (year: number, month: number) => {
  const from = toIso(new Date(year, month, 1));
  const to = toIso(new Date(year, month + 1, 0));
  return { from, to };
};

/** Месяц без года — ближайший прошедший (или текущий) */
function resolveYear(month: number): number {
  const today = fromIso(TODAY_ISO);
  return month > today.getMonth() ? today.getFullYear() - 1 : today.getFullYear();
}

function startOfWeek(iso: string): string {
  const d = fromIso(iso);
  const shift = (d.getDay() + 6) % 7; // понедельник
  return addDays(iso, -shift);
}

interface Rule {
  re: RegExp;
  apply: (m: RegExpMatchArray, q: ParsedQuery) => QueryToken['label'] | undefined;
  kind: TokenKind;
}

const RULES: Rule[] = [
  // Направление
  {
    kind: 'direction',
    re: /(?:^|\s)(входящ[а-яa-z0-9]*|поступлен[а-яa-z0-9]*|приход[а-яa-z0-9]*|зачислен[а-яa-z0-9]*|доход[а-яa-z0-9]*)(?=\s|$)/,
    apply: (_, q) => ((q.direction = 'in'), 'Входящие'),
  },
  {
    kind: 'direction',
    re: /(?:^|\s)(исходящ[а-яa-z0-9]*|списан[а-яa-z0-9]*|расход[а-яa-z0-9]*|трат[а-яa-z0-9]*|потрат[а-яa-z0-9]*|ушло)(?=\s|$)/,
    apply: (_, q) => ((q.direction = 'out'), 'Исходящие'),
  },
  // Сумма: «от 50 000», «больше 100 тыс», «до 10к», «около 250 000»
  {
    kind: 'amount',
    re: new RegExp(String.raw`(?:^|\s)(?:от|больше|более|свыше|>)\s*` + NUMBER),
    apply: (m, q) => {
      const min = toNumber(m[1], m[2]);
      q.amount = { ...q.amount, min };
      return `от ${formatRub(min)}`;
    },
  },
  {
    kind: 'amount',
    re: new RegExp(String.raw`(?:^|\s)(?:до|меньше|менее|<)\s*` + NUMBER),
    apply: (m, q) => {
      const max = toNumber(m[1], m[2]);
      q.amount = { ...q.amount, max };
      return `до ${formatRub(max)}`;
    },
  },
  {
    kind: 'amount',
    re: new RegExp(String.raw`(?:^|\s)(?:около|примерно|порядка|~)\s*` + NUMBER),
    apply: (m, q) => {
      const n = toNumber(m[1], m[2]);
      q.amount = { min: n * 0.9, max: n * 1.1 };
      return `≈ ${formatRub(n)}`;
    },
  },
  // Число с единицей без предлога: «250к», «1,5 млн» — точная сумма ±1%
  {
    kind: 'amount',
    re: new RegExp(String.raw`(?:^|\s)(\d[\d\s]*(?:[.,]\d+)?)\s*(млн|миллион[а-я]*|тыс[а-я]*|к|k)(?=\s|$)`),
    apply: (m, q) => {
      const n = toNumber(m[1], m[2]);
      q.amount = { min: n * 0.99, max: n * 1.01 };
      return formatRub(n);
    },
  },
  // Период
  {
    kind: 'period',
    re: /(?:^|\s)(?:за\s+|на\s+)?сегодня(?=\s|$)/,
    apply: (_, q) => ((q.period = { from: TODAY_ISO, to: TODAY_ISO }), 'Сегодня'),
  },
  {
    kind: 'period',
    re: /(?:^|\s)(?:за\s+)?вчера(?=\s|$)/,
    apply: (_, q) => {
      const d = addDays(TODAY_ISO, -1);
      q.period = { from: d, to: d };
      return 'Вчера';
    },
  },
  {
    kind: 'period',
    re: /(?:^|\s)(?:за\s+|на\s+)?(?:эта|этой|эту|текущая|текущей|текущую)\s+недел[а-яa-z0-9]*/,
    apply: (_, q) => ((q.period = { from: startOfWeek(TODAY_ISO), to: TODAY_ISO }), 'Эта неделя'),
  },
  {
    kind: 'period',
    re: /(?:^|\s)(?:за\s+|на\s+)?прошл[а-яa-z0-9]+\s+недел[а-яa-z0-9]*/,
    apply: (_, q) => {
      const from = addDays(startOfWeek(TODAY_ISO), -7);
      q.period = { from, to: addDays(from, 6) };
      return 'Прошлая неделя';
    },
  },
  {
    kind: 'period',
    re: /(?:^|\s)(?:за\s+|в\s+)?(?:этом|этот|текущем|текущий)\s+месяц[а-яa-z0-9]*/,
    apply: (_, q) => {
      const t = fromIso(TODAY_ISO);
      q.period = { from: monthRange(t.getFullYear(), t.getMonth()).from, to: TODAY_ISO };
      return MONTHS_NOM[t.getMonth()] + ' ' + t.getFullYear();
    },
  },
  {
    kind: 'period',
    re: /(?:^|\s)(?:за\s+|в\s+)?прошл[а-яa-z0-9]+\s+месяц[а-яa-z0-9]*/,
    apply: (_, q) => {
      const t = fromIso(TODAY_ISO);
      const d = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      q.period = monthRange(d.getFullYear(), d.getMonth());
      return MONTHS_NOM[d.getMonth()] + ' ' + d.getFullYear();
    },
  },
  {
    kind: 'period',
    re: /(?:^|\s)(?:за\s+|в\s+)?([1-4])\s*(?:-?й\s+)?(?:квартал[а-яa-z0-9]*|кв\.?)(?:\s+(20\d\d))?/,
    apply: (m, q) => {
      const n = Number(m[1]);
      const year = m[2] ? Number(m[2]) : fromIso(TODAY_ISO).getFullYear();
      q.period = { from: monthRange(year, (n - 1) * 3).from, to: monthRange(year, n * 3 - 1).to };
      return `${n} квартал ${year}`;
    },
  },
  {
    kind: 'period',
    re: new RegExp(String.raw`(?:^|\s)(?:за\s+|в\s+|во\s+)?(` + MONTH_STEMS.join('|') + String.raw`)[а-яa-z0-9]*(?:\s+(20\d\d))?(?=\s|$)`),
    apply: (m, q) => {
      const month = MONTH_STEMS.findIndex((stem) => new RegExp('^' + stem).test(m[1]));
      if (month < 0) return undefined;
      const year = m[2] ? Number(m[2]) : resolveYear(month);
      q.period = monthRange(year, month);
      return `${MONTHS_NOM[month]} ${year}`;
    },
  },
  // Статус
  {
    kind: 'status',
    re: /(?:^|\s)(?:на\s+)?подпис[а-яa-z0-9]*(?=\s|$)/,
    apply: (_, q) => ((q.status = 'sign'), STATUS_LABEL.sign),
  },
  {
    kind: 'status',
    re: /(?:^|\s)(?:нужны|ждут|ждет|без)\s+документ[а-яa-z0-9]*/,
    apply: (_, q) => ((q.status = 'docs'), STATUS_LABEL.docs),
  },
  {
    kind: 'status',
    re: /(?:^|\s)в\s+процессе(?=\s|$)/,
    apply: (_, q) => ((q.status = 'progress'), STATUS_LABEL.progress),
  },
  // Валюта
  {
    kind: 'currency',
    re: /(?:^|\s)(валютн[а-яa-z0-9]*|доллар[а-яa-z0-9]*|usd|вэд)(?=\s|$)/,
    apply: (_, q) => ((q.currency = true), 'Валютные'),
  },
];

/** Служебные слова, которые не нужно искать как текст */
const STOP = /(?:^|\s)(за|в|во|на|по|с|со|и|от|до|у|все|всё|мои|мне|покажи|показать|найди|найти|сколько|было|платеж[а-яa-z0-9]*|платёж[а-яa-z0-9]*|операци[а-яa-z0-9]*|перевод[а-яa-z0-9]*)(?=\s|$)/g;

/** Основное слово контрагента: «Лаванда, ООО» → «лаванда» */
const counterpartyKey = (name: string) => norm(name.split(',')[0]).replace(/["«»]/g, '').trim();

export function parseQuery(query: string, counterparties: string[]): ParsedQuery {
  const parsed: ParsedQuery = { text: '', tokens: [] };
  let rest = ' ' + norm(query) + ' ';

  for (const rule of RULES) {
    // Один фильтр каждого вида; сумма может быть диапазоном «от … до …»
    if (rule.kind !== 'amount' && parsed.tokens.some((t) => t.kind === rule.kind)) continue;
    const m = rest.match(rule.re);
    if (!m) continue;
    const label = rule.apply(m, parsed);
    if (!label) continue;
    parsed.tokens.push({ kind: rule.kind, label, raw: m[0].trim() });
    rest = rest.replace(m[0], ' ');
  }

  // Контрагент: слово из запроса совпадает с началом названия (с учётом падежей — первые 4+ буквы)
  const words = rest.split(/\s+/).filter((w) => w.length >= 3);
  for (const name of Array.from(new Set(counterparties))) {
    const key = counterpartyKey(name);
    const stem = key.slice(0, Math.max(4, key.length - 2));
    const hit = words.find((w) => w.length >= 4 && (key.startsWith(w) || w.startsWith(stem)));
    if (hit) {
      parsed.counterparty = name;
      parsed.tokens.push({ kind: 'counterparty', label: name, raw: hit });
      rest = rest.replace(new RegExp(String.raw`(^|\s)` + hit + String.raw`(?=\s|$)`), ' ');
      break;
    }
  }

  parsed.text = rest.replace(STOP, ' ').replace(/\s+/g, ' ').trim();
  return parsed;
}

/** Есть ли в запросе что-то кроме обычного текста */
export const isSmart = (q: ParsedQuery) => q.tokens.length > 0;

export function smartMatches(payment: Payment, comment: string | undefined, q: ParsedQuery): boolean {
  if (q.direction === 'in' && payment.sum <= 0) return false;
  if (q.direction === 'out' && payment.sum >= 0) return false;
  if (q.period && (payment.date < q.period.from || payment.date > q.period.to)) return false;
  if (q.amount) {
    const abs = Math.abs(payment.sum);
    if (q.amount.min !== undefined && abs < q.amount.min) return false;
    if (q.amount.max !== undefined && abs > q.amount.max) return false;
  }
  if (q.status && payment.status !== q.status) return false;
  if (q.currency && !payment.currency) return false;
  if (q.counterparty && payment.counterparty !== q.counterparty) return false;
  return q.text ? paymentMatches(payment, comment, q.text) || stemMatches(payment, comment, q.text) : true;
}

/** Простой учёт падежей: «аренду» → «аренд», «лаванды» → «лаванд» */
const stem = (word: string) => (word.length >= 5 ? word.replace(/(ами|ями|ого|ему|ой|ей|ом|ем|ах|ях|ам|ям|ую|юю|ы|и|а|я|у|ю|е|о)$/, '') : word);

/** Каждое слово запроса (по основе) — начало какого-то слова в контрагенте, назначении или комментарии */
function stemMatches(payment: Payment, comment: string | undefined, text: string): boolean {
  const haystack = norm([payment.counterparty, payment.description, comment ?? ''].join(' ')).split(/[^а-яa-z0-9]+/);
  return norm(text)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.some((h) => h.startsWith(stem(word))));
}

/** Снять фильтр — вырезать его фрагмент из запроса */
export function removeToken(query: string, token: QueryToken): string {
  const i = norm(query).indexOf(token.raw);
  if (i < 0) return query;
  return (query.slice(0, i) + query.slice(i + token.raw.length)).replace(/\s+/g, ' ').trim();
}

/** Итоги по найденному: количество и суммы (рублёвые) */
export function summarize(payments: Payment[]) {
  const rub = payments.filter((p) => !p.currency);
  return {
    count: payments.length,
    income: rub.filter((p) => p.sum > 0).reduce((acc, p) => acc + p.sum, 0),
    expense: rub.filter((p) => p.sum < 0).reduce((acc, p) => acc + Math.abs(p.sum), 0),
  };
}

/** Подсказки продолжения запроса: «входящие» → «входящие за сентябрь», «за прошлый месяц»… */
export function completions(query: string, parsed: ParsedQuery, counterparties: string[]): string[] {
  const base = query.trim();
  if (!base) return [];
  const out: string[] = [];
  const t = fromIso(TODAY_ISO);
  const prevMonth = MONTHS_NOM[(t.getMonth() + 11) % 12].toLowerCase();
  const thisMonth = MONTHS_NOM[t.getMonth()].toLowerCase();
  const endsWithZa = /\sза$/.test(base);

  if (!parsed.period && (parsed.direction || parsed.counterparty || parsed.status || endsWithZa)) {
    const stem = endsWithZa ? base : `${base} за`;
    out.push(`${stem} ${thisMonth}`, `${stem} ${prevMonth}`, `${stem} эту неделю`);
  }
  if (parsed.period && !parsed.direction && !parsed.status && !parsed.text) {
    const rest = base.replace(/^(входящ|исходящ)[а-яa-z0-9]*\s*/, '');
    out.push(`входящие ${rest}`, `исходящие ${rest}`);
  }
  if ((parsed.direction || parsed.period) && !parsed.amount && out.length < 3) {
    out.push(`${base} от 100 тыс`);
  }

  // Контрагент по началу слова: «лав» → «Лаванда, ООО»
  const last = norm(base.split(/\s+/).pop() ?? '');
  if (!parsed.counterparty && last.length >= 2) {
    Array.from(new Set(counterparties))
      .filter((name) => counterpartyKey(name).startsWith(last))
      .slice(0, 2)
      .forEach((name) => out.unshift(base.slice(0, base.length - last.length) + counterpartyKey(name)));
  }
  return Array.from(new Set(out.map((s) => s.replace(/\s+/g, ' ').trim()))).filter((s) => norm(s) !== norm(base)).slice(0, 3);
}

/* ---------- Состояние фильтров «Операций» ---------- */

/** Фильтры, вынесенные из запроса в чипы: направление, период и «дополнительные» */
export interface FilterState {
  direction?: 'in' | 'out';
  period?: { from: string; to: string; label: string };
  amount?: { min?: number; max?: number; label: string };
  status?: { value: PaymentStatus; label: string };
  currency?: { label: string };
  counterparty?: { value: string; label: string };
}

/** Что распознано в запросе → состояние фильтров */
export function toFilterState(q: ParsedQuery): FilterState {
  const label = (kind: TokenKind) => q.tokens.filter((t) => t.kind === kind).map((t) => t.label).join(' ');
  return {
    ...(q.direction ? { direction: q.direction } : {}),
    ...(q.period ? { period: { ...q.period, label: label('period') } } : {}),
    ...(q.amount ? { amount: { ...q.amount, label: label('amount') } } : {}),
    ...(q.status ? { status: { value: q.status, label: label('status') } } : {}),
    ...(q.currency ? { currency: { label: label('currency') } } : {}),
    ...(q.counterparty ? { counterparty: { value: q.counterparty, label: q.counterparty } } : {}),
  };
}

/** Набранное в поле поверх сохранённых фильтров */
export const mergeFilters = (base: FilterState, typed: FilterState): FilterState => ({ ...base, ...typed });

/** Дополнительные фильтры — те, для которых нет своего чипа (уходят в кнопку фильтров) */
export const extraFilters = (f: FilterState) =>
  [f.amount?.label, f.status?.label, f.currency?.label, f.counterparty?.label].filter((x): x is string => Boolean(x));

export const hasFilters = (f: FilterState) => Boolean(f.direction || f.period || extraFilters(f).length);

export function filterMatches(payment: Payment, comment: string | undefined, f: FilterState, text: string): boolean {
  return smartMatches(payment, comment, {
    direction: f.direction,
    period: f.period,
    amount: f.amount,
    status: f.status?.value,
    currency: Boolean(f.currency),
    counterparty: f.counterparty?.value,
    text,
    tokens: [],
  });
}

/** Варианты периода для чипа «За всё время» */
export function periodOptions(): { label: string; from: string; to: string }[] {
  const phrases = ['эта неделя', 'этот месяц', 'прошлый месяц', '3 квартал'];
  const t = fromIso(TODAY_ISO);
  for (let i = 2; i <= 4; i += 1) phrases.push(MONTHS_NOM[(t.getMonth() - i + 12) % 12].toLowerCase());
  return phrases
    .map((phrase) => toFilterState(parseQuery(phrase, [])).period)
    .filter((p): p is { from: string; to: string; label: string } => Boolean(p));
}
