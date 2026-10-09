import type React from 'react';

/**
 * Банк контрагента — в кружке аватара вместо инициалов.
 * Цвета — фирменные цвета банков (это логотипы, а не UI, поэтому не токены t-ds).
 */
interface Bank {
  name: string;
  mark: string;
  surface: string;
  color: string;
}

const BANKS = {
  sber: { name: 'Сбербанк', mark: 'С', surface: '#21A038', color: '#FFFFFF' },
  tbank: { name: 'Т-Банк', mark: 'Т', surface: '#FFDD2D', color: '#333333' },
  alfa: { name: 'Альфа-Банк', mark: 'А', surface: '#EF3124', color: '#FFFFFF' },
  vtb: { name: 'ВТБ', mark: 'ВТБ', surface: '#0A2896', color: '#FFFFFF' },
  tochka: { name: 'Точка', mark: 'Т', surface: '#7F3FE0', color: '#FFFFFF' },
  gpb: { name: 'Газпромбанк', mark: 'Г', surface: '#00387B', color: '#FFFFFF' },
  ozon: { name: 'Озон Банк', mark: 'О', surface: '#005BFF', color: '#FFFFFF' },
  treasury: { name: 'Казначейство России', mark: 'К', surface: '#1E3A5F', color: '#FFFFFF' },
  foreign: { name: 'Иностранный банк', mark: '$', surface: '#5A6B7B', color: '#FFFFFF' },
} satisfies Record<string, Bank>;

const BY_COUNTERPARTY: Record<string, keyof typeof BANKS> = {
  'УФК по Сибирской области': 'treasury',
  'Global Trade Ltd': 'foreign',
  'Лаванда, ООО': 'sber',
  'Дмитрий Олегович С.': 'tbank',
  'БЦ Лесная, ООО': 'vtb',
  'Склад-Сервис, ООО': 'alfa',
  'Анютикина С.И., ИП': 'tochka',
  'Величко, Д.А., ИП': 'tbank',
  'Засыпкина Д.В., ИП': 'ozon',
  'Кириенко С.В., ИП': 'tochka',
  'Лотос, ИП': 'alfa',
  'Орхидея, АО': 'gpb',
  'Петрова А.С.': 'sber',
  'Промт, ООО': 'tochka',
  'Ромашка, ООО': 'sber',
  'Телеком Плюс, АО': 'vtb',
  'Техносфера, ООО': 'alfa',
};

const ORDER = Object.keys(BANKS).slice(0, 7) as (keyof typeof BANKS)[];

/** Банк контрагента; для новых (демо) контрагентов — стабильно по имени */
export function bankOf(counterparty: string): Bank {
  const key = BY_COUNTERPARTY[counterparty];
  if (key) return BANKS[key];
  const hash = Array.from(counterparty).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return BANKS[ORDER[hash % ORDER.length]];
}

/** Стили для Avatar из t-ds: фон и цвет буквы через его CSS-переменные */
export const bankAvatarStyle = (bank: Bank) =>
  ({ '--avatar-surface': bank.surface, '--avatar-color': bank.color }) as React.CSSProperties;
