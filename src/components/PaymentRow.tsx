import React from 'react';
import { Avatar, IconButton, Tag } from '@pluginwoman/t-ds';
import { Payment, STATUS_COLOR, STATUS_LABEL, formatAmount } from '../data';

export interface QuickAction {
  /** Короткая подпись в тултипе */
  tooltip: string;
  /** Полное название для скринридеров */
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

/** Быстрые действия — появляются поверх правой части строки при наведении/фокусе */
export const QuickActionsBar: React.FC<{ actions: QuickAction[] }> = ({ actions }) => (
  <div className="payment-row__actions" onClick={(e) => e.stopPropagation()}>
    {actions.map((action) => (
      <span key={action.tooltip} className="quick-action">
        <IconButton icon={action.icon} ariaLabel={action.label} variant="transparent" size="l" onClick={action.onClick} />
        <span className="quick-action__tooltip ts-400-s" aria-hidden="true">
          {action.tooltip}
        </span>
      </span>
    ))}
  </div>
);

interface PaymentRowProps {
  payment: Payment;
  comment?: string;
  isSelected: boolean;
  /** Показывать статус под суммой (в списке на подпись он одинаковый — скрываем) */
  hasStatus?: boolean;
  /** Элемент слева от суммы — например, чекбокс выбора */
  leading?: React.ReactNode;
  quickActions: QuickAction[];
  onSelect: () => void;
  /** Клик по тегу комментария — отфильтровать список по нему */
  onTagClick?: (comment: string) => void;
  /** Компактная строка без номера и времени (главная, компактный вид) */
  isCompact?: boolean;
}

export const PaymentRow: React.FC<PaymentRowProps> = ({
  payment,
  comment,
  isSelected,
  hasStatus = true,
  leading,
  quickActions,
  onSelect,
  onTagClick,
  isCompact = false,
}) => (
  <div
    role="button"
    tabIndex={0}
    className={['payment-row', isSelected ? 'is-selected' : '', isCompact ? 'payment-row--compact' : '']
      .filter(Boolean)
      .join(' ')}
    onClick={onSelect}
    onKeyDown={(e) => {
      if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onSelect();
      }
    }}
  >
    {leading && (
      <div className="payment-row__leading" onClick={(e) => e.stopPropagation()}>
        {leading}
      </div>
    )}

    <div className="payment-row__sum">
      <span
        className="ts-600-m payment-row__amount"
        style={{ color: payment.sum > 0 ? 'var(--primitive-success)' : undefined }}
      >
        {formatAmount(payment.sum)}
      </span>
      {hasStatus && (
        <span className="ts-500-xs" style={{ color: STATUS_COLOR[payment.status] }}>
          {STATUS_LABEL[payment.status]}
        </span>
      )}
    </div>

    <div className="payment-row__data">
      <span className="ts-500-m">{payment.counterparty}</span>
      <span className="ts-400-s payment-row__secondary">{payment.description}</span>
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
      {!isCompact && <span className="ts-400-xs payment-row__secondary">{payment.meta}</span>}
    </div>

    <Avatar size={32} shape="circle" label={payment.avatarLabel} />

    <QuickActionsBar actions={quickActions} />
  </div>
);
