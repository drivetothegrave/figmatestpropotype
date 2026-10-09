import React from 'react';
import { formatRub, plural } from '../data';

interface SmartTotalProps {
  count: number;
  income: number;
  expense: number;
  className?: string;
}

/** Итог по найденному: «7 операций   + 312 300 ₽   – 777 000 ₽» (макет «Результаты поиска») */
export const SmartTotal: React.FC<SmartTotalProps> = ({ count, income, expense, className = '' }) => (
  <p className={['ts-500-s smart-total', className].filter(Boolean).join(' ')}>
    <span className="smart-total__count">
      {count} {plural(count, ['операция', 'операции', 'операций'])}
    </span>
    {income > 0 && <span className="smart-total__income">+ {formatRub(income)}</span>}
    {expense > 0 && <span className="smart-total__expense">– {formatRub(expense)}</span>}
  </p>
);
