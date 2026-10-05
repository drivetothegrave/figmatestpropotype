import React from 'react';
import { Chip, IconButton } from '@pluginwoman/t-ds';
import {
  ArrowDownUnderline,
  ArrowReturnRight,
  BubbleListShort,
  CalendarAcsArrowRotationRight,
  Printer,
  Share,
} from '@pluginwoman/t-ds/icons';
import { Filters } from '@pluginwoman/t-ds/icons/20/Stroked';
import { Payment, PaymentDay } from '../data';
import { filterDays, paymentMatches } from '../suggest';
import { PaymentRow, QuickAction } from './PaymentRow';
import { SearchWithSuggest } from './SearchWithSuggest';

const FILTERS = ['Все операции', 'За всё время', 'Счёт', 'Карта', 'Категория'];

interface PaymentHistoryProps {
  days: PaymentDay[];
  comments: Record<string, string>;
  selectedId?: string;
  onSelect: (payment: Payment) => void;
  onComment: (payment: Payment) => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ days, comments, selectedId, onSelect, onComment }) => {
  const [query, setQuery] = React.useState('');

  // Подсказки в поиске — только из комментариев, которые есть у операций
  const commentTexts = Object.values(comments);
  const visibleDays = filterDays(days, (payment) => paymentMatches(payment, comments[payment.id], query));

  const quickActions = (payment: Payment): QuickAction[] => [
    {
      tooltip: 'Комментарий',
      label: comments[payment.id] ? 'Изменить комментарий' : 'Оставить комментарий',
      icon: <BubbleListShort />,
      onClick: () => onComment(payment),
    },
    { tooltip: 'Скачать', label: 'Скачать', icon: <ArrowDownUnderline /> },
    { tooltip: 'Распечатать', label: 'Распечатать', icon: <Printer /> },
    { tooltip: 'Поделиться', label: 'Поделиться', icon: <Share /> },
    { tooltip: 'Запланировать', label: 'Запланировать', icon: <CalendarAcsArrowRotationRight /> },
    { tooltip: 'Повторить', label: 'Повторить', icon: <ArrowReturnRight /> },
  ];

  return (
    <div className="history-card">
      <div className="history-card__filters">
        <IconButton icon={<Filters />} ariaLabel="Фильтры" variant="secondary" size="xs" />
        {FILTERS.map((label) => (
          <Chip key={label} variant="dropdown">
            {label}
          </Chip>
        ))}
        <SearchWithSuggest value={query} onChange={setQuery} suggestions={commentTexts} />
      </div>

      {visibleDays.map((day) => (
        <section key={day.title} className="history-day">
          <h3 className="ts-600-xl history-day__title">{day.title}</h3>
          {day.payments.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              comment={comments[payment.id]}
              isSelected={payment.id === selectedId}
              quickActions={quickActions(payment)}
              onSelect={() => onSelect(payment)}
              onTagClick={setQuery}
            />
          ))}
        </section>
      ))}

      {visibleDays.length === 0 && <p className="ts-400-m history-card__empty">Ничего не нашлось</p>}
    </div>
  );
};
