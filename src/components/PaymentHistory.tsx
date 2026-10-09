import React from 'react';
import { Checkbox, Chip, IconButton } from '@pluginwoman/t-ds';
import {
  ArrowDownUnderline,
  ArrowReturnRight,
  BubbleListShort,
  CalendarAcsArrowRotationRight,
  Printer,
  Share,
} from '@pluginwoman/t-ds/icons';
import { Filters } from '@pluginwoman/t-ds/icons/20/Stroked';
import { Payment, PaymentDay, formatRub, inRub } from '../data';
import { filterDays } from '../suggest';
import { completions, isSmart, parseQuery, removeToken, smartMatches, summarize } from '../smartQuery';
import { SmartSummary } from './SmartSummary';
import { PaymentRow, QuickAction } from './PaymentRow';
import { SearchWithSuggest } from './SearchWithSuggest';
import { PaymentTableRow } from './PaymentTableRow';
import { SelectionBar } from './SelectionBar';
import { ViewToggle } from './ViewToggle';

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
  /** Комментарий сразу нескольким выделенным операциям */
  onBulkComment: (payments: Payment[]) => void;
  /** Вид списка общий для вкладок «Операций» */
  isCompactView: boolean;
  onViewChange: (isCompact: boolean) => void;
}

/** Итоги дня: поступления и списания */
export const DayTotals: React.FC<{ payments: Payment[] }> = ({ payments: all }) => {
  const payments = inRub(all);
  const income = payments.filter((p) => p.sum > 0).reduce((acc, p) => acc + p.sum, 0);
  const expense = payments.filter((p) => p.sum < 0).reduce((acc, p) => acc + Math.abs(p.sum), 0);
  return (
    <span className="day-totals ts-500-s">
      {income > 0 && <span className="day-totals__income">+ {formatRub(income)}</span>}
      {expense > 0 && <span>– {formatRub(expense)}</span>}
    </span>
  );
};

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  days,
  comments,
  query,
  onQueryChange,
  selectedId,
  onSelect,
  onComment,
  onBulkComment,
  isCompactView,
  onViewChange,
}) => {
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [checked, setChecked] = React.useState<Set<string>>(new Set());

  // Подсказки в поиске — только из комментариев, которые есть у операций
  const commentTexts = Object.values(comments);
  // Запрос разбирается на фильтры: «входящие за май от 50 тыс» и т. п.
  const counterparties = days.flatMap((day) => day.payments.map((p) => p.counterparty));
  const parsed = parseQuery(query, counterparties);
  const visibleDays = filterDays<PaymentDay, Payment>(days, (payment) => smartMatches(payment, comments[payment.id], parsed));
  const foundCount = visibleDays.reduce((acc, day) => acc + day.payments.length, 0);
  const visible = visibleDays.flatMap((day) => day.payments);
  const selected = visible.filter((p) => checked.has(p.id));

  const setMany = (ids: string[], value: boolean) =>
    setChecked((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (value ? next.add(id) : next.delete(id)));
      return next;
    });

  const stopSelecting = () => {
    setIsSelecting(false);
    setChecked(new Set());
  };

  const checkbox = (payment: Payment) =>
    isSelecting ? (
      <Checkbox
        isChecked={checked.has(payment.id)}
        onChange={(value) => setMany([payment.id], value)}
        label={`Выбрать операцию ${payment.counterparty}`}
      />
    ) : undefined;

  return (
    <div className={['history-card', isSelecting && selected.length > 0 ? 'history-card--with-bar' : ''].join(' ')}>
      <div className="history-card__filters">
        <IconButton icon={<Filters />} ariaLabel="Фильтры" variant="secondary" size="xs" />
        <SearchWithSuggest
          value={query}
          onChange={onQueryChange}
          suggestions={commentTexts}
          completions={query.trim() ? completions(query, parsed, counterparties) : []}
        />
        {FILTERS.map((label) => (
          <Chip key={label} variant="dropdown">
            {label}
          </Chip>
        ))}
        {/* Режим выделения — чип в панели фильтров, без отдельной строки */}
        <Chip
          variant="chip"
          isSelected={isSelecting}
          isDisabled={visible.length === 0}
          onClick={() => (isSelecting ? stopSelecting() : setIsSelecting(true))}
        >
          {isSelecting ? 'Отменить' : 'Выбрать'}
        </Chip>
        <ViewToggle isCompact={isCompactView} onChange={onViewChange} />
      </div>

      {query.trim() !== '' && (
        <SmartSummary
          className="history-card__smart"
          tokens={parsed.tokens}
          text={parsed.text}
          {...summarize(visibleDays.flatMap((day) => day.payments))}
          onRemove={(token) => onQueryChange(removeToken(query, token))}
        />
      )}

      {visibleDays.map((day) => {
        const dayIds = day.payments.map((p) => p.id);
        const dayChecked = dayIds.filter((id) => checked.has(id)).length;
        return (
          <section key={day.title} className={['history-day', isCompactView ? 'history-day--table' : ''].join(' ')}>
            <div className="history-day__header">
              {isSelecting && (
                <Checkbox
                  isChecked={dayChecked === dayIds.length}
                  isIndeterminate={dayChecked > 0 && dayChecked < dayIds.length}
                  onChange={(value) => setMany(dayIds, value)}
                  label={`Выбрать все операции за ${day.title}`}
                />
              )}
              <h3 className="ts-600-xl history-day__title">{day.title}</h3>
              {isCompactView && <DayTotals payments={day.payments} />}
            </div>
            {day.payments.map((payment) => {
              const common = {
                payment,
                comment: comments[payment.id],
                isSelected: payment.id === selectedId || checked.has(payment.id),
                leading: checkbox(payment),
                quickActions: historyQuickActions(payment, comments[payment.id], onComment),
                // В режиме выделения клик по строке отмечает её, иначе — открывает детали
                onSelect: () => (isSelecting ? setMany([payment.id], !checked.has(payment.id)) : onSelect(payment)),
                onTagClick: onQueryChange,
              };
              return isCompactView ? (
                <PaymentTableRow key={payment.id} {...common} />
              ) : (
                <PaymentRow key={payment.id} {...common} />
              );
            })}
          </section>
        );
      })}

      {isSelecting && selected.length > 0 && (
        <SelectionBar selected={selected} onComment={() => onBulkComment(selected)} onClear={stopSelecting} />
      )}

      {visibleDays.length === 0 && <p className="ts-400-m history-card__empty">Ничего не нашлось</p>}
    </div>
  );
};
