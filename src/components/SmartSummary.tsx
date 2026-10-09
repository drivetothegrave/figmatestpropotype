import React from 'react';
import { formatRub, plural } from '../data';

interface SmartTotalProps {
  count: number;
  income: number;
  expense: number;
  className?: string;
  children?: React.ReactNode;
}

/** Итог по найденному: «36 операций · + 1,8 млн ₽ · – 4,2 млн ₽» */
export const SmartTotal: React.FC<SmartTotalProps> = ({ count, income, expense, className = '', children }) => (
  <p className={['ts-400-s smart-total', className].filter(Boolean).join(' ')}>
    {count === 0 ? (
      'Ничего не нашлось'
    ) : (
      <>
        {count} {plural(count, ['операция', 'операции', 'операций'])}
        {income > 0 && <span className="smart-total__income"> · + {formatRub(income)}</span>}
        {expense > 0 && <span> · – {formatRub(expense)}</span>}
      </>
    )}
    {children}
  </p>
);
