import React from 'react';
import { Avatar, Tag } from '@pluginwoman/t-ds';
import { Payment, PaymentStatus, STATUS_LABEL, formatAmount } from '../data';
import { QuickAction, QuickActionsBar } from './PaymentRow';

/** Тон плашки статуса */
const STATUS_TONE: Record<PaymentStatus, 'success' | 'neutral' | 'brand'> = {
  done: 'success',
  credited: 'success',
  progress: 'neutral',
  'second-sign': 'neutral',
  sign: 'brand',
};

/** «№6884, 13:40» → «13:40» */
export const timeOf = (payment: Payment) => payment.meta.split(', ').pop() ?? '';

interface PaymentTableRowProps {
  payment: Payment;
  comment?: string;
  isSelected: boolean;
  leading?: React.ReactNode;
  quickActions: QuickAction[];
  onSelect: () => void;
  onTagClick?: (comment: string) => void;
}

/**
 * Строка компактного вида «Операций» — в одну линию, как таблица:
 * сумма · получатель · статус · комментарий и назначение · время.
 */
export const PaymentTableRow: React.FC<PaymentTableRowProps> = ({
  payment,
  comment,
  isSelected,
  leading,
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

    <span
      className="ts-600-m payment-table-row__sum"
      style={{ color: payment.sum > 0 ? 'var(--primitive-success)' : undefined }}
    >
      {formatAmount(payment.sum)}
    </span>

    <span className="payment-table-row__counterparty">
      <Avatar size={24} shape="circle" label={payment.avatarLabel} />
      <span className="ts-500-m payment-table-row__ellipsis">{payment.counterparty}</span>
    </span>

    <span className="payment-table-row__status">
      <Tag shape="circle" size="l" variant="outlined" className={`status-tag status-tag--${STATUS_TONE[payment.status]}`}>
        {STATUS_LABEL[payment.status]}
      </Tag>
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

    <span className="ts-400-s payment-table-row__time">{timeOf(payment)}</span>

    <QuickActionsBar actions={quickActions} />
  </div>
);
