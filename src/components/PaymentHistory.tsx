import React from 'react';
import { Avatar, Chip, IconButton, Search, TabsCarousel, Tag } from '@pluginwoman/t-ds';
import { Filters } from '@pluginwoman/t-ds/icons/20/Stroked';
import { PAYMENT_DAYS, Payment, STATUS_COLOR, STATUS_LABEL } from '../data';

const FILTERS = ['Все операции', 'За всё время', 'Счёт', 'Карта', 'Категория'];

interface PaymentHistoryProps {
  comments: Record<string, string>;
  selectedId?: string;
  onSelect: (payment: Payment) => void;
}

const PaymentRow: React.FC<{
  payment: Payment;
  comment?: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ payment, comment, isSelected, onSelect }) => (
  <button
    type="button"
    className={['payment-row', isSelected ? 'is-selected' : ''].filter(Boolean).join(' ')}
    onClick={onSelect}
  >
    <div className="payment-row__sum">
      <span
        className="ts-600-m payment-row__amount"
        style={{ color: payment.isIncome ? 'var(--primitive-success)' : undefined }}
      >
        {payment.amount}
      </span>
      <span className="ts-500-xs" style={{ color: STATUS_COLOR[payment.status] }}>
        {STATUS_LABEL[payment.status]}
      </span>
    </div>

    <div className="payment-row__data">
      <span className="ts-500-m">{payment.counterparty}</span>
      <span className="ts-400-s payment-row__secondary">{payment.description}</span>
      {comment && (
        <Tag shape="square" size="m" className="comment-tag comment-tag--list">
          {comment}
        </Tag>
      )}
      <span className="ts-400-xs payment-row__secondary">{payment.meta}</span>
    </div>

    <Avatar size={32} shape="circle" label={payment.avatarLabel} />
  </button>
);

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ comments, selectedId, onSelect }) => {
  const [query, setQuery] = React.useState('');

  const days = PAYMENT_DAYS.map((day) => ({
    ...day,
    payments: day.payments.filter((payment) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [payment.counterparty, payment.description, payment.amount, comments[payment.id] ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    }),
  })).filter((day) => day.payments.length > 0);

  const history = (
    <div className="history-card">
      <div className="history-card__filters">
        <IconButton icon={<Filters />} ariaLabel="Фильтры" variant="secondary" size="xs" />
        {FILTERS.map((label) => (
          <Chip key={label} variant="dropdown">
            {label}
          </Chip>
        ))}
        <Search
          className="history-card__search"
          value={query}
          onChange={setQuery}
          placeholder="Контрагент, сумма, назначение"
        />
      </div>

      {days.map((day) => (
        <section key={day.title} className="history-day">
          <h3 className="ts-600-xl history-day__title">{day.title}</h3>
          {day.payments.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              comment={comments[payment.id]}
              isSelected={payment.id === selectedId}
              onSelect={() => onSelect(payment)}
            />
          ))}
        </section>
      ))}

      {days.length === 0 && <p className="ts-400-m history-card__empty">Ничего не нашлось</p>}
    </div>
  );

  return (
    <TabsCarousel
      size="2xl"
      className="history-tabs"
      tabs={[
        { label: 'История', content: history },
        { label: 'На подпись', badge: 3, content: <div className="history-card history-card__empty ts-400-m">Здесь будут платежи на подпись</div> },
        { label: 'Автоплатежи', content: <div className="history-card history-card__empty ts-400-m">Автоплатежей пока нет</div> },
      ]}
    />
  );
};
