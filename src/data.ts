export type PaymentStatus = 'done' | 'progress' | 'sign' | 'credited' | 'second-sign' | 'docs';

export interface Payment {
  id: string;
  /** Сумма: отрицательная — списание, положительная — поступление */
  sum: number;
  /** Валюта, если не рубли — в рублёвые итоги не попадает */
  currency?: 'USD';
  status: PaymentStatus;
  counterparty: string;
  description: string;
  meta: string;
  avatarLabel: string;
  /** Дата операции, YYYY-MM-DD */
  date: string;
  /** «9 октября 2026, 14:05» — вычисляется из даты и времени */
  dateTime: string;
  operationName: string;
  recipient: string;
  inn: string;
  kpp: string;
  account: string;
  bik: string;
  bank: string;
  corrAccount: string;
  /** Для платежей на подпись — «Создано» */
  createdAt?: string;
  createdBy?: string;
}

export interface PaymentDay {
  date: string;
  title: string;
  payments: Payment[];
}

export const STATUS_LABEL: Record<PaymentStatus, string> = {
  done: 'Исполнено',
  progress: 'В процессе',
  sign: 'На подпись',
  credited: 'Зачислено',
  'second-sign': 'Ожидает вторую подпись',
  docs: 'Нужны документы',
};

export const STATUS_COLOR: Record<PaymentStatus, string> = {
  done: 'var(--primitive-success)',
  progress: 'var(--primitive-neutral-4)',
  sign: 'var(--primitive-brand)',
  credited: 'var(--primitive-success)',
  'second-sign': 'var(--primitive-secondary)',
  docs: 'var(--primitive-brand)',
};

const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

/** 250000 → «250 000 ₽» */
export function formatRub(value: number): string {
  return `${rub.format(Math.abs(value))} ₽`;
}

const usd = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** −250000 → «– 250 000 ₽», 50000 → «+ 50 000 ₽», валюта — «+ 12 400,00 $» */
export function formatAmount(sum: number, currency?: 'USD'): string {
  const value = currency === 'USD' ? `${usd.format(Math.abs(sum))} $` : formatRub(sum);
  return `${sum < 0 ? '–' : '+'} ${value}`;
}

/** Рублёвые платежи — для итогов и сумм */
export const inRub = <T extends { currency?: string }>(payments: T[]) => payments.filter((p) => !p.currency);

/** plural(3, ['платёж', 'платежа', 'платежей']) → «платежа» */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export const paymentsWord = (n: number) => `${n} ${plural(n, ['платёж', 'платежа', 'платежей'])}`;

const requisites = {
  inn: '8176 9703 71',
  kpp: '771 001 001',
  account: '4070 2810 0022 7000 2495',
  bik: '044 525 104',
  bank: 'АО «АЛЬФА-БАНК»',
  corrAccount: '3010 1810 8452 5000 0999',
};

const signInfo = {
  createdBy: 'Солодов Олег Алексеевич',
};

/** Последние операции — исходные данные; даты задаются ниже, по дням */
const RECENT_DAYS: { payments: Omit<Payment, 'date' | 'dateTime'>[] }[] = [
  {
    payments: [
      {
        id: 'p0',
        sum: -250000,
        status: 'done',
        counterparty: 'УФК по Сибирской области',
        description: 'Оплата налогов за 3 квартал 2026',
        meta: '№6891, 14:05',
        avatarLabel: 'УФК',
        operationName: 'Налоговый платёж №6891',
        recipient: 'УФК по Сибирской области (Межрайонная ИФНС №4)',
        ...requisites,
      },
      {
        id: 'v1',
        sum: 12400,
        currency: 'USD',
        status: 'docs',
        counterparty: 'Global Trade Ltd',
        description: 'Входящий валютный платёж. Загрузите документы для валютного контроля',
        meta: 'USD ··0091, 11:45',
        avatarLabel: 'G',
        operationName: 'Входящий валютный платёж',
        recipient: 'Global Trade Ltd',
        ...requisites,
      },
      {
        id: 'i1',
        sum: 62600,
        status: 'credited',
        counterparty: 'Анютикина С.И., ИП',
        description: 'Оплата маркетинговых услуг по договору №18',
        meta: '№3090, 11:00',
        avatarLabel: 'А',
        operationName: 'Входящий платёж №3090',
        recipient: 'Анютикина С.И., ИП',
        ...requisites,
      },
      {
        id: 'p1',
        sum: -250000,
        status: 'done',
        counterparty: 'Лаванда, ООО',
        description:
          'Оплата лицензионного вознаграждения за использование базовой лицензии за период с 01.11.22 по 30.11.22. НДС не предусмотрен.',
        meta: '№6884, 13:40',
        avatarLabel: 'Л',
        operationName: 'Платёж по реквизитам №6884',
        recipient: 'Лаванда, ООО',
        ...requisites,
      },
      {
        id: 's1',
        sum: -180000,
        status: 'sign',
        counterparty: 'БЦ Лесная, ООО',
        description: 'Арендная плата за октябрь 2026 по договору №14/А от 01.02.2025. НДС не облагается',
        meta: '№6890, 12:15',
        avatarLabel: 'БЦ',
        operationName: 'Платёж по реквизитам №6890',
        recipient: 'Бизнес-центр «Лесная», ООО',
        ...signInfo,
        ...requisites,
      },
      {
        id: 's2',
        sum: -95000,
        status: 'sign',
        counterparty: 'Склад-Сервис, ООО',
        description: 'Аренда складского помещения за октябрь 2026 по договору №7 от 15.01.2025, в т. ч. НДС 20%',
        meta: '№6889, 11:02',
        avatarLabel: 'СС',
        operationName: 'Платёж по реквизитам №6889',
        recipient: 'Склад-Сервис, ООО',
        ...signInfo,
        ...requisites,
      },
      {
        id: 'p2',
        sum: -2000,
        status: 'progress',
        counterparty: 'Дмитрий Олегович С.',
        description: '+7 (906) 917‑10‑18',
        meta: '№6884, 13:40',
        avatarLabel: 'ДС',
        operationName: 'Перевод по номеру телефона',
        recipient: 'Дмитрий Олегович С.',
        ...requisites,
      },
      {
        id: 'i2',
        sum: 249700,
        status: 'credited',
        counterparty: 'Лаванда, ООО',
        description: 'Оплата за использование ПО «Онлайн-касса»',
        meta: '№6372, 10:30',
        avatarLabel: 'Л',
        operationName: 'Входящий платёж №6372',
        recipient: 'Лаванда, ООО',
        ...requisites,
      },
    ],
  },
  {
    payments: [
      {
        id: 'p3',
        sum: -250000,
        status: 'sign',
        counterparty: 'Величко, Д.А., ИП',
        description: 'По договору №8923 от 10 октября 2022 в т.ч. НДС 20%',
        meta: '№6884, 13:40',
        avatarLabel: 'В',
        operationName: 'Платёж по реквизитам №6884',
        recipient: 'Величко Дмитрий Александрович, ИП',
        ...signInfo,
        ...requisites,
      },
      {
        id: 's3',
        sum: -12500,
        status: 'sign',
        counterparty: 'БЦ Лесная, ООО',
        description: 'Возмещение коммунальных услуг за сентябрь 2026 по договору №14/А от 01.02.2025',
        meta: '№6881, 10:30',
        avatarLabel: 'БЦ',
        operationName: 'Платёж по реквизитам №6881',
        recipient: 'Бизнес-центр «Лесная», ООО',
        ...signInfo,
        ...requisites,
      },
      {
        id: 'p4',
        sum: 50000,
        status: 'credited',
        counterparty: 'Промт, ООО',
        description: 'Оплата услуг контрагенту по договору подряда №206 от 12.03.2019, в т. ч. НДС 18%',
        meta: '№6884, 13:40',
        avatarLabel: 'П',
        operationName: 'Входящий платёж №6884',
        recipient: 'Промт, ООО',
        ...requisites,
      },
      {
        id: 'i3',
        sum: 18500,
        status: 'credited',
        counterparty: 'Ромашка, ООО',
        description: 'Возврат аванса по соглашению о расторжении',
        meta: '№6838, 12:10',
        avatarLabel: 'Р',
        operationName: 'Входящий платёж №6838',
        recipient: 'Ромашка, ООО',
        ...requisites,
      },
    ],
  },
  {
    payments: [
      {
        id: 'p5',
        sum: -250000,
        status: 'second-sign',
        counterparty: 'Засыпкина Д.В., ИП',
        description: 'По договору №8923 от 10 октября 2022 в т.ч. НДС 20%',
        meta: '№6884, 13:40',
        avatarLabel: 'З',
        operationName: 'Платёж по реквизитам №6884',
        recipient: 'Засыпкина Дарья Викторовна, ИП',
        ...requisites,
      },
      {
        id: 'i4',
        sum: 303200,
        status: 'credited',
        counterparty: 'Лотос, ИП',
        description: 'Оплата подписки «Финансы» за сервис аналитики',
        meta: '№4162, 14:45',
        avatarLabel: 'Л',
        operationName: 'Входящий платёж №4162',
        recipient: 'Лотос, ИП',
        ...requisites,
      },
      {
        id: 'p6',
        sum: -77000,
        status: 'done',
        counterparty: 'Кириенко С.В., ИП',
        description: 'Оплата услуг контрагенту по договору подряда №206 от 12.03.2019, в т. ч. НДС 10%',
        meta: '№126, 13:40',
        avatarLabel: 'К',
        operationName: 'Платёж по реквизитам №126',
        recipient: 'Кириенко Сергей Владимирович, ИП',
        ...requisites,
      },
    ],
  },
];

/** Платежи на подпись сразу «протегированы» — чтобы было что фильтровать */
export const DEFAULT_COMMENTS: Record<string, string> = {
  s1: 'Аренда офиса',
  s2: 'Аренда склада',
  s3: 'Аренда офиса',
  p3: 'Покупка оборудования',
};

/* ---------- Даты ---------- */

/** «Сегодня» в прототипе */
export const TODAY_ISO = '2026-10-09';

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const pad = (n: number) => String(n).padStart(2, '0');
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (iso: string, days: number) => {
  const d = fromIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
};

/** «2026-10-09» → «9 октября» */
export const dayMonth = (iso: string) => {
  const d = fromIso(iso);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
};

/** Заголовок дня: «Сегодня, 9 октября», «Вчера, 8 октября», «22 сентября», «5 мая 2025» */
export function dayTitle(iso: string): string {
  if (iso === TODAY_ISO) return `Сегодня, ${dayMonth(iso)}`;
  if (iso === addDays(TODAY_ISO, -1)) return `Вчера, ${dayMonth(iso)}`;
  return iso.slice(0, 4) === TODAY_ISO.slice(0, 4) ? dayMonth(iso) : `${dayMonth(iso)} ${iso.slice(0, 4)}`;
}

/** «№6884, 13:40» → «13:40» */
const timeOfMeta = (meta: string) => meta.split(', ').pop() ?? '';

function withDate(payment: Omit<Payment, 'date' | 'dateTime'>, date: string): Payment {
  const dateTime = `${dayMonth(date)} ${date.slice(0, 4)}, ${timeOfMeta(payment.meta)}`;
  return { ...payment, date, dateTime, ...(payment.status === 'sign' ? { createdAt: dateTime } : {}) };
}

// Последние операции: сегодня, вчера и 22 сентября
const RECENT_DATES = [TODAY_ISO, addDays(TODAY_ISO, -1), '2026-09-22'];
const RECENT: Payment[] = RECENT_DAYS.flatMap((day, i) => day.payments.map((p) => withDate(p, RECENT_DATES[i])));

/* ---------- История за полгода — регулярные операции, чтобы было что искать ---------- */

interface Recurring {
  key: string;
  day: number;
  sum: number;
  counterparty: string;
  avatarLabel: string;
  description: (month: string) => string;
  comment?: string;
  time: string;
  /** В какие месяцы (0–11) — по умолчанию каждый */
  months?: number[];
}

const RECURRING: Recurring[] = [
  { key: 'office', day: 5, sum: -180000, counterparty: 'БЦ Лесная, ООО', avatarLabel: 'БЦ', time: '10:15', comment: 'Аренда офиса',
    description: (m) => `Арендная плата за ${m} 2026 по договору №14/А от 01.02.2025. НДС не облагается` },
  { key: 'stock', day: 10, sum: -95000, counterparty: 'Склад-Сервис, ООО', avatarLabel: 'СС', time: '11:30', comment: 'Аренда склада',
    description: (m) => `Аренда складского помещения за ${m} 2026 по договору №7, в т. ч. НДС 20%` },
  { key: 'telecom', day: 15, sum: -8900, counterparty: 'Телеком Плюс, АО', avatarLabel: 'ТП', time: '09:40', comment: 'Связь и интернет',
    description: (m) => `Оплата услуг связи и интернета за ${m} по счёту №5521, в т. ч. НДС 20%` },
  { key: 'salary', day: 25, sum: -64000, counterparty: 'Петрова А.С.', avatarLabel: 'ПА', time: '16:00', comment: 'Зарплата',
    description: (m) => `Заработная плата за ${m} 2026. НДФЛ удержан` },
  { key: 'lavanda', day: 12, sum: 249700, counterparty: 'Лаванда, ООО', avatarLabel: 'Л', time: '12:30',
    description: () => 'Оплата за использование ПО «Онлайн-касса»' },
  { key: 'promt', day: 20, sum: 50000, counterparty: 'Промт, ООО', avatarLabel: 'П', time: '13:40',
    description: () => 'Оплата услуг по договору подряда №206 от 12.03.2019, в т. ч. НДС 18%' },
  { key: 'anyut', day: 18, sum: 62600, counterparty: 'Анютикина С.И., ИП', avatarLabel: 'А', time: '11:00', months: [4, 6, 8],
    description: () => 'Оплата маркетинговых услуг по договору №18' },
  { key: 'orchid', day: 8, sum: 1438000, counterparty: 'Орхидея, АО', avatarLabel: 'О', time: '17:40', months: [4, 7],
    description: () => 'Оплата поставки оборудования по счёту №311' },
  { key: 'lotos', day: 22, sum: 303200, counterparty: 'Лотос, ИП', avatarLabel: 'Л', time: '14:45', months: [3, 5, 7],
    description: () => 'Оплата подписки «Финансы» за сервис аналитики' },
  { key: 'tax', day: 25, sum: -250000, counterparty: 'УФК по Сибирской области', avatarLabel: 'УФК', time: '14:05', months: [3, 6],
    description: (m) => `Оплата налогов, авансовый платёж (${m})` },
  { key: 'equipment', day: 3, sum: -312000, counterparty: 'Техносфера, ООО', avatarLabel: 'Т', time: '15:20', months: [5], comment: 'Покупка оборудования',
    description: () => 'Оплата по счёту №318 за ноутбуки и мониторы, в т. ч. НДС 20%' },
];

const MONTHS_PREP = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

/** Комментарии к сгенерированной истории — чтобы «аренда офиса за июль» что-то находила */
export const HISTORY_COMMENTS: Record<string, string> = {};

// Апрель – начало октября 2026
const HISTORY: Payment[] = [];
for (let month = 3; month <= 9; month += 1) {
  RECURRING.forEach((r) => {
    if (r.months && !r.months.includes(month)) return;
    const date = `2026-${pad(month + 1)}-${pad(r.day)}`;
    // Только прошедшие дни до «вчера»; октябрьские аренды сейчас на подписи — их не дублируем
    if (date >= addDays(TODAY_ISO, -1)) return;
    if (month === 9 && (r.key === 'office' || r.key === 'stock')) return;
    const id = `h-${r.key}-${month + 1}`;
    const isIncome = r.sum > 0;
    HISTORY.push(
      withDate(
        {
          id,
          sum: r.sum,
          status: isIncome ? 'credited' : 'done',
          counterparty: r.counterparty,
          description: r.description(MONTHS_PREP[month]),
          meta: `№${5000 + HISTORY.length * 7}, ${r.time}`,
          avatarLabel: r.avatarLabel,
          operationName: isIncome ? 'Входящий платёж' : 'Платёж по реквизитам',
          recipient: r.counterparty,
          ...requisites,
        },
        date,
      ),
    );
    if (r.comment) HISTORY_COMMENTS[id] = r.comment;
  });
}

const byNewest = (a: Payment, b: Payment) =>
  b.date.localeCompare(a.date) || timeOfMeta(b.meta).localeCompare(timeOfMeta(a.meta));

/** Все операции прототипа — от новых к старым */
export const BASE_PAYMENTS: Payment[] = [...RECENT, ...HISTORY].sort(byNewest);

/** Группировка по дням для таймлайна */
export function groupByDay(payments: Payment[]): PaymentDay[] {
  const days: PaymentDay[] = [];
  [...payments].sort(byNewest).forEach((p) => {
    const last = days[days.length - 1];
    if (last && last.date === p.date) last.payments.push(p);
    else days.push({ date: p.date, title: dayTitle(p.date), payments: [p] });
  });
  return days;
}

/* ---------- Демо: генерация новых платежей на подпись ---------- */

const DEMO_TEMPLATES: { counterparty: string; recipient: string; avatarLabel: string; description: string; comment: string; sums: number[] }[] = [
  {
    counterparty: 'БЦ Лесная, ООО',
    recipient: 'Бизнес-центр «Лесная», ООО',
    avatarLabel: 'БЦ',
    description: 'Арендная плата по договору №14/А от 01.02.2025. НДС не облагается',
    comment: 'Аренда офиса',
    sums: [180000, 12500, 24000],
  },
  {
    counterparty: 'Склад-Сервис, ООО',
    recipient: 'Склад-Сервис, ООО',
    avatarLabel: 'СС',
    description: 'Аренда складского помещения по договору №7 от 15.01.2025, в т. ч. НДС 20%',
    comment: 'Аренда склада',
    sums: [95000, 47500],
  },
  {
    counterparty: 'Телеком Плюс, АО',
    recipient: 'Телеком Плюс, АО',
    avatarLabel: 'ТП',
    description: 'Оплата услуг связи и интернета по счёту №5521, в т. ч. НДС 20%',
    comment: 'Связь и интернет',
    sums: [8900, 14300],
  },
  {
    counterparty: 'Техносфера, ООО',
    recipient: 'Техносфера, ООО',
    avatarLabel: 'Т',
    description: 'Оплата по счёту №318 за ноутбуки и мониторы, в т. ч. НДС 20%',
    comment: 'Покупка оборудования',
    sums: [312000, 86000],
  },
  {
    counterparty: 'Петрова А.С.',
    recipient: 'Петрова Анна Сергеевна',
    avatarLabel: 'ПА',
    description: 'Заработная плата за сентябрь 2026. НДФЛ удержан',
    comment: 'Зарплата',
    sums: [64000, 72500],
  },
];

/** Новый платёж на подпись «на сегодня» со случайным шаблоном и комментарием */
export function createDemoSignPayment(): { payment: Payment; comment: string } {
  const template = DEMO_TEMPLATES[Math.floor(Math.random() * DEMO_TEMPLATES.length)];
  const sum = template.sums[Math.floor(Math.random() * template.sums.length)];
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const number = 6900 + Math.floor(Math.random() * 100);
  return {
    comment: template.comment,
    payment: {
      id: `demo-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
      sum: -sum,
      status: 'sign',
      counterparty: template.counterparty,
      description: template.description,
      meta: `№${number}, ${time}`,
      avatarLabel: template.avatarLabel,
      date: TODAY_ISO,
      dateTime: `${dayMonth(TODAY_ISO)} 2026, ${time}`,
      operationName: `Платёж по реквизитам №${number}`,
      recipient: template.recipient,
      createdAt: `${dayMonth(TODAY_ISO)} 2026, ${time}`,
      ...signInfo,
      ...requisites,
    },
  };
}
