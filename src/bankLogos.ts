import alfabank from './assets/banks/alfabank.svg';
import bankRossii from './assets/banks/bank-rossii.svg';
import raiffeisenbank from './assets/banks/raiffeisenbank.svg';
import sarovbiznesbank from './assets/banks/sarovbiznesbank.svg';
import sberbank from './assets/banks/sberbank.svg';
import severgazbank from './assets/banks/severgazbank.svg';

/** Логотипы банков контрагентов (TUI Universal, 48×48) — в кружке аватара операции */
const COMMERCIAL = [sberbank, alfabank, raiffeisenbank, severgazbank, sarovbiznesbank];

/**
 * Банк контрагента для прототипа: бюджетные платежи (УФК, ФНС) — Банк России,
 * остальным — «случайный», но стабильный по имени контрагента банк
 */
export function bankLogoOf(counterparty: string): string {
  if (/УФК|ФНС|Казначейств/i.test(counterparty)) return bankRossii;
  const hash = Array.from(counterparty).reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return COMMERCIAL[hash % COMMERCIAL.length];
}
