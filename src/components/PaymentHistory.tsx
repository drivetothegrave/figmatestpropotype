import React from 'react';
import { Chip, IconButton } from '@pluginwoman/t-ds';
import {
  ArrowDownUnderline,
  ArrowReturnRight,
  BubbleListShort,
  CalendarAcsArrowRotationRight,
  LayoutRowsTwo,
  LinesThreeHorizontal,
  Printer,
  Share,
} from '@pluginwoman/t-ds/icons';
import { Filters } from '@pluginwoman/t-ds/icons/20/Stroked';
import { Payment, PaymentDay } from '../data';
import { filterDays, paymentMatches } from '../suggest';
import { PaymentRow, QuickAction } from './PaymentRow';
import { SearchWithSuggest } from './SearchWithSuggest';

const FILTERS = ['Все операции', 'За всё время', 'Категория'];

/** Быстрые действия строки истории — общие для главной и «Операций» */
export function historyQuickActions(
  payment: Payment,
  comment: string | undefined,
  onComment: (payment: Payment) => void,
): QuickAction[] {
  return [
    {
      tooltip: 'Комментарий',
      label: comment ? 'Изменить комментарий' : 'Оставить комментарий',
      icon: <BubbleListShort />,
      onClick: () => onComment(payment),
    },
    { tooltip: 'Скачать', label: 'Скачать', icon: <ArrowDownUnderline /> },
    { tooltip: 'Распечатать', label: 'Распечатать', icon: <Printer /> },
    { tooltip: 'Поделиться', label: 'Поделиться', icon: <Share /> },
    { tooltip: 'Запланировать', label: 'Запланировать', icon: <CalendarAcsArrowRotationRight /> },
    { tooltip: 'Повторить', label: 'Повторить', icon: <ArrowReturnRight /> },
  ];
}

interface PaymentHistoryProps {
  days: PaymentDay[];
  comments: Record<string, string>;
  /** Поиск управляется снаружи — чтобы главная могла открыть «Операции» с запросом */
  query: string;
  onQueryChange: (query: string) => void;
  selectedId?: string;
  onSelect: (payment: Payment) => void;
  onComment: (payment: Payment) => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  days,
  comments,
  query,
  onQueryChange,
  selectedId,
  onSelect,
  onComment,
}) => {
  const [isCompactView, setIsCompactView] = React.useState(false);

  // Подсказки в поиске — только из комментариев, которые есть у операций
  const commentTexts = Object.values(comments);
  const visibleDays = filterDays(days, (payment) => paymentMatches(payment, comments[payment.id], query));
  const foundCount = visibleDays.reduce((acc, day) => acc + day.payments.length, 0);

  return (
    <div className="history-card">
      <div className="history-card__filters">
        <IconButton icon={<Filters />} ariaLabel="Фильтры" variant="secondary" size="xs" />
        <SearchWithSuggest value={query} onChange={onQueryChange} suggestions={commentTexts} />
        {FILTERS.map((label) => (
          <Chip key={label} variant="dropdown">
            {label}
          </Chip>
        ))}
        <div className="history-card__view" role="group" aria-label="Вид списка">
          <IconButton
            icon={<LayoutRowsTwo />}
            ariaLabel="Подробный вид"
            variant="secondary"
            size="xs"
            className={!isCompactView ? 'is-active' : undefined}
            onClick={() => setIsCompactView(false)}
          />
          <IconButton
            icon={<LinesThreeHorizontal />}
            ariaLabel="Компактный вид"
            variant="secondary"
            size="xs"
            className={isCompactView ? 'is-active' : undefined}
            onClick={() => setIsCompactView(true)}
          />
        </div>
      </div>

      {query.trim() !== '' && foundCount > 0 && (
        <p className="ts-400-s history-card__found">
          Найдено: {foundCount} по запросу «{query.trim()}».{' '}
          <button type="button" className="sign-list__link ts-500-s hoverOpacity" onClick={() => onQueryChange('')}>
            Сбросить поиск
          </button>
        </p>
      )}

      {visibleDays.map((day) => (
        <section key={day.title} className="history-day">
          <h3 className="ts-600-xl history-day__title">{day.title}</h3>
          {day.payments.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              comment={comments[payment.id]}
              isSelected={payment.id === selectedId}
              isCompact={isCompactView}
              quickActions={historyQuickActions(payment, comments[payment.id], onComment)}
              onSelect={() => onSelect(payment)}
              onTagClick={onQueryChange}
            />
          ))}
        </section>
      ))}

      {visibleDays.length === 0 && <p className="ts-400-m history-card__empty">Ничего не нашлось</p>}
    </div>
  );
};
