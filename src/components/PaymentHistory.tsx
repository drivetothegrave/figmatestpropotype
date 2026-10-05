import React from 'react';
import { Avatar, Chip, IconButton, Search, TabsCarousel, Tag } from '@pluginwoman/t-ds';
import {
  ArrowDownUnderline,
  ArrowReturnRight,
  BubbleListShort,
  CalendarAcsArrowRotationRight,
  Printer,
  Share,
} from '@pluginwoman/t-ds/icons';
import { Filters } from '@pluginwoman/t-ds/icons/20/Stroked';
import { PAYMENT_DAYS, Payment, STATUS_COLOR, STATUS_LABEL } from '../data';
import { matchSuggestions, matchesQuery } from '../suggest';
import { SuggestPopup, useSuggestKeyboard } from './SuggestPopup';

const FILTERS = ['Все операции', 'За всё время', 'Счёт', 'Карта', 'Категория'];

interface PaymentHistoryProps {
  comments: Record<string, string>;
  selectedId?: string;
  onSelect: (payment: Payment) => void;
  onComment: (payment: Payment) => void;
}

const PaymentRow: React.FC<{
  payment: Payment;
  comment?: string;
  isSelected: boolean;
  onSelect: () => void;
  onComment: () => void;
}> = ({ payment, comment, isSelected, onSelect, onComment }) => {
  // tooltip — короткая подпись как у кнопок в дровере, ariaLabel — полное действие для скринридеров
  const quickActions = [
    {
      tooltip: 'Комментарий',
      label: comment ? 'Изменить комментарий' : 'Оставить комментарий',
      icon: <BubbleListShort />,
      onClick: onComment,
    },
    { tooltip: 'Скачать', label: 'Скачать', icon: <ArrowDownUnderline /> },
    { tooltip: 'Распечатать', label: 'Распечатать', icon: <Printer /> },
    { tooltip: 'Поделиться', label: 'Поделиться', icon: <Share /> },
    { tooltip: 'Запланировать', label: 'Запланировать', icon: <CalendarAcsArrowRotationRight /> },
    { tooltip: 'Повторить', label: 'Повторить', icon: <ArrowReturnRight /> },
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      className={['payment-row', isSelected ? 'is-selected' : ''].filter(Boolean).join(' ')}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
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

      {/* Быстрые действия — появляются при наведении/фокусе на строке */}
      <div className="payment-row__actions" onClick={(e) => e.stopPropagation()}>
        {quickActions.map((action) => (
          <span key={action.tooltip} className="quick-action">
            <IconButton
              icon={action.icon}
              ariaLabel={action.label}
              variant="transparent"
              size="l"
              onClick={action.onClick}
            />
            <span className="quick-action__tooltip ts-400-s" aria-hidden="true">
              {action.tooltip}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ comments, selectedId, onSelect, onComment }) => {
  const [query, setQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isSuggestClosed, setIsSuggestClosed] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Подсказки в поиске — только из комментариев, которые есть у операций
  const commentTexts = Array.from(new Set(Object.values(comments)));
  const suggestions = query.trim()
    ? matchSuggestions(commentTexts, query).filter((item) => item !== query.trim())
    : [];
  const isSuggestOpen = isSearchFocused && !isSuggestClosed && suggestions.length > 0;

  const selectSuggestion = (item: string) => {
    setQuery(item);
    setIsSuggestClosed(true);
  };
  const keyboard = useSuggestKeyboard(suggestions, isSuggestOpen, selectSuggestion, () => setIsSuggestClosed(true));

  const days = PAYMENT_DAYS.map((day) => ({
    ...day,
    payments: day.payments.filter((payment) => {
      if (!query.trim()) return true;
      const haystack = [payment.counterparty, payment.description, payment.amount];
      const comment = comments[payment.id];
      return (
        haystack.join(' ').toLowerCase().includes(query.trim().toLowerCase()) ||
        (comment !== undefined && matchesQuery(comment, query))
      );
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
        <div
          ref={searchRef}
          className="history-card__search"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onKeyDown={keyboard.onKeyDown}
        >
          <Search
            value={query}
            onChange={(next) => {
              setQuery(next);
              setIsSuggestClosed(false);
            }}
            placeholder="Контрагент, сумма, назначение"
          />
        </div>
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
              onComment={() => onComment(payment)}
            />
          ))}
        </section>
      ))}

      {days.length === 0 && <p className="ts-400-m history-card__empty">Ничего не нашлось</p>}

      <SuggestPopup
        anchorRef={searchRef}
        isOpen={isSuggestOpen}
        items={suggestions}
        activeIndex={keyboard.activeIndex}
        onSelect={selectSuggestion}
      />
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
