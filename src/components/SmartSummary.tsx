import React from 'react';
import { Chip } from '@pluginwoman/t-ds';
import { formatRub, plural } from '../data';
import { QueryToken } from '../smartQuery';

interface SmartSummaryProps {
  tokens: QueryToken[];
  /** Остаток запроса, который ищем как текст */
  text: string;
  count: number;
  income: number;
  expense: number;
  /** Если передан — у чипов появляется крестик, чтобы снять фильтр */
  onRemove?: (token: QueryToken) => void;
  className?: string;
}

/** «Понял как: [Входящие] [Май 2026] «аренда» — 4 операции · + 1,8 млн ₽» */
export const SmartSummary: React.FC<SmartSummaryProps> = ({ tokens, text, count, income, expense, onRemove, className = '' }) => (
  <div className={['smart-summary', className].filter(Boolean).join(' ')}>
    <div className="smart-summary__tokens">
      <span className="ts-400-s smart-summary__label">Понял как</span>
      {tokens.map((token) =>
        onRemove ? (
          <Chip key={token.kind + token.raw} variant="action" isSelected onClose={() => onRemove(token)} onClick={() => onRemove(token)}>
            {token.label}
          </Chip>
        ) : (
          <span key={token.kind + token.raw} className="ts-500-s smart-summary__token">
            {token.label}
          </span>
        ),
      )}
      {text && <span className="ts-500-s smart-summary__text">«{text}»</span>}
    </div>
    <p className="ts-400-s smart-summary__total">
      {count === 0 ? (
        'Ничего не нашлось'
      ) : (
        <>
          {count} {plural(count, ['операция', 'операции', 'операций'])}
          {income > 0 && <span className="smart-summary__income"> · + {formatRub(income)}</span>}
          {expense > 0 && <span> · – {formatRub(expense)}</span>}
        </>
      )}
    </p>
  </div>
);
