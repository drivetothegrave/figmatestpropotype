// «Умный» поиск по комментариям: без учёта регистра и ё/е, по началу любого слова,
// слова запроса в любом порядке, плюс исправление раскладки (fhtylf → аренда).

const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";
const RU = 'йцукенгшщзхъфывапролджэячсмитьбюё';

function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

function fixLayout(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => {
      const i = EN.indexOf(ch);
      return i >= 0 ? RU[i] : ch;
    })
    .join('');
}

/** Чем меньше — тем релевантнее; null — не подходит */
function score(text: string, query: string): number | null {
  const t = normalize(text);
  const q = normalize(query);
  if (!q) return 0;
  if (t.startsWith(q)) return 0;

  const words = t.split(/[\s,.;:«»"()\-–—/]+/).filter(Boolean);
  const parts = q.split(' ');
  const allPrefixes = parts.every((part) => words.some((word) => word.startsWith(part)));
  if (allPrefixes) return 1;

  if (t.includes(q)) return 2;
  return null;
}

export function matchSuggestions(items: string[], query: string, limit = 5): string[] {
  const variants = [query, fixLayout(query)];
  return items
    .map((item, index) => {
      const scores = variants.map((v) => score(item, v)).filter((s): s is number => s !== null);
      return { item, index, score: scores.length ? Math.min(...scores) : null };
    })
    .filter((x): x is { item: string; index: number; score: number } => x.score !== null)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((x) => x.item)
    .slice(0, limit);
}

export function matchesQuery(text: string, query: string): boolean {
  return matchSuggestions([text], query, 1).length > 0;
}

interface Searchable {
  id: string;
  counterparty: string;
  description: string;
  sum: number;
}

/** Совпадает ли платёж с запросом: контрагент, назначение, сумма или комментарий */
export function paymentMatches(payment: Searchable, comment: string | undefined, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\s/g, '');
  const plain = [payment.counterparty, payment.description].join(' ').toLowerCase();
  return (
    plain.includes(q) ||
    (/^\d+$/.test(digits) && String(Math.abs(payment.sum)).includes(digits)) ||
    (comment !== undefined && matchesQuery(comment, query))
  );
}

/** Оставляет в днях только подходящие платежи и убирает пустые дни */
export function filterDays<D extends { payments: P[] }, P extends Searchable>(
  days: D[],
  predicate: (payment: P) => boolean,
): D[] {
  return days
    .map((day) => ({ ...day, payments: day.payments.filter(predicate) }))
    .filter((day) => day.payments.length > 0);
}
