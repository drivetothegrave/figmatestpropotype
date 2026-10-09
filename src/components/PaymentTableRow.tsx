import React from 'react';
import { Tag } from '@pluginwoman/t-ds';
import { Payment, STATUS_COLOR, STATUS_LABEL, formatAmount } from '../data';
import { BankAvatar } from './BankAvatar';
import { QuickAction, QuickActionsBar } from './PaymentRow';

/** «№6884, 13:40» → «13:40» */
export const timeOf = (payment: Payment) => payment.meta.split(', ').pop() ?? '';

interface PaymentTableRowProps {
  payment: Payment;
  comment?: string;
  isSelected: boolean;
  leading?: React.ReactNode;
  /** На вкладке «На подпись» статус у всех одинаковый — скрываем колонку */
  hasStatus?: boolean;
  quickActions: QuickAction[];
  onSelect: () => void;
  onTagClick?: (comment: string) => void;
}

/**
 * Строка компактного вида «Операций» — в одну линию, как таблица:
 * сумма со статусом под ней · получатель · комментарий и назначение · номер и время.
 */
export const PaymentTableRow: React.FC<PaymentTableRowProps> = ({
  payment,
  comment,
  isSelected,
  leading,
  hasStatus = true,
  quickActions,
  onSelect,
  onTagClick,
}) => (
  <div
    role="button"
    tabIndex={0}
    className={['payment-row', 'payment-table-row', isSelected ? 'is-selected' : ''].filter(Boolean).join(' ')}
    onClick={onSelect}
    onKeyDown={(e) => {
      if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onSelect();
      }
    }}
  >
    {leading && (
      <div className="payment-table-row__leading" onClick={(e) => e.stopPropagation()}>
        {leading}
      </div>
    )}

    <span className="payment-table-row__amount">
      <span
        className="ts-600-m payment-table-row__sum"
        style={{ color: payment.sum > 0 ? 'var(--primitive-success)' : undefined }}
      >
        {formatAmount(payment.sum, payment.currency)}
      </span>
      {hasStatus && (
        <span
          className="ts-500-xs payment-table-row__status payment-table-row__ellipsis"
          style={{ color: STATUS_COLOR[payment.status] }}
        >
          {STATUS_LABEL[payment.status]}
        </span>
      )}
    </span>

    <span className="payment-table-row__counterparty">
      <BankAvatar size={24} counterparty={payment.counterparty} />
      <span className="ts-500-m payment-table-row__ellipsis">{payment.counterparty}</span>
    </span>

    <span className="payment-table-row__purpose">
      {comment &&
        (onTagClick ? (
          <button
            type="button"
            className="payment-row__tag hoverOpacity"
            title="Показать платежи с этим комментарием"
            onClick={(e) => {
              e.stopPropagation();
              onTagClick(comment);
            }}
          >
            <Tag shape="square" size="m" className="comment-tag comment-tag--list">
              {comment}
            </Tag>
          </button>
        ) : (
          <Tag shape="square" size="m" className="comment-tag comment-tag--list">
            {comment}
          </Tag>
        ))}
      <span className="ts-400-s payment-table-row__ellipsis payment-row__secondary">{payment.description}</span>
    </span>

    <span className="ts-400-s payment-table-row__time">{payment.meta}</span>

    <QuickActionsBar actions={quickActions} />
  </div>
);
