import React from 'react';
import { Cell, Checkbox, Chip, IconButton } from '@pluginwoman/t-ds';
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
import {
  FilterState,
  QueryToken,
  completions,
  extraFilters,
  filterMatches,
  mergeFilters,
  parseQuery,
  periodOptions,
  removeToken,
  toFilterState,
} from '../smartQuery';
import { PaymentRow, QuickAction } from './PaymentRow';
import { SearchWithSuggest } from './SearchWithSuggest';
import { PaymentTableRow } from './PaymentTableRow';
import { SelectionBar } from './SelectionBar';
import { ViewToggle } from './ViewToggle';

const DIRECTIONS: { value?: 'in' | 'out'; label: string }[] = [
  { label: 'Все операции' },
  { value: 'in', label: 'Входящие' },
  { value: 'out', label: 'Исходящие' },
];

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
  /** Свободный текст поиска — управляется снаружи, чтобы главная могла открыть «Операции» с запросом */
  query: string;
  onQueryChange: (query: string) => void;
  /** Фильтры в чипах: направление, период и дополнительные (сумма, контрагент, статус, валюта) */
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
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
  filters,
  onFiltersChange,
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
  // Набранное в поле сразу отражается в чипах; по Enter распознанное «переезжает» в чипы
  const parsed = parseQuery(query, counterparties);
  const effective = mergeFilters(filters, toFilterState(parsed));
  const visibleDays = filterDays<PaymentDay, Payment>(days, (payment) =>
    filterMatches(payment, comments[payment.id], effective, parsed.text),
  );

  /** Убрать из поля распознанные фрагменты нужных видов — фильтр теперь задаёт чип */
  const stripTyped = (kinds: QueryToken['kind'][]) =>
    parsed.tokens.filter((t) => kinds.includes(t.kind)).reduce((q, t) => removeToken(q, t), query);

  const commit = () => {
    onFiltersChange(effective);
    onQueryChange(parsed.text);
  };

  const setDirection = (direction?: 'in' | 'out') => {
    onFiltersChange({ ...filters, direction });
    onQueryChange(stripTyped(['direction']));
  };

  const setPeriod = (period?: FilterState['period']) => {
    onFiltersChange({ ...filters, period });
    onQueryChange(stripTyped(['period']));
  };

  const clearExtra = () => {
    onFiltersChange({ direction: filters.direction, period: filters.period });
    onQueryChange(stripTyped(['amount', 'status', 'currency', 'counterparty']));
  };

  const extra = extraFilters(effective);

  /** Активный фильтр в выпадашке: стрелку заменяет белый крестик, как у кнопки фильтров */
  const clearable = (chip: React.ReactNode, isActive: boolean, onClear: () => void, label: string) =>
    isActive ? (
      <span className="chip-clearable">
        {chip}
        <button type="button" className="chip-clearable__clear" aria-label={`Сбросить: ${label}`} onClick={onClear}>
          <span className="chip__cross" aria-hidden="true" />
        </button>
      </span>
    ) : (
      chip
    );
  const directionLabel = DIRECTIONS.find((d) => d.value === effective.direction)?.label ?? 'Все операции';
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
        {extra.length > 0 ? (
          // Фильтры без своего чипа — счётчик в кнопке фильтров, крестик сбрасывает
          <span title={extra.join(' · ')}>
            <Chip
              variant="action"
              isSelected
              leftAccessory="icon"
              leftIcon={<Filters />}
              onClose={clearExtra}
              className="filters-chip"
            >
              {extra.length}
            </Chip>
          </span>
        ) : (
          <IconButton icon={<Filters />} ariaLabel="Фильтры" variant="secondary" size="xs" />
        )}
        <SearchWithSuggest
          value={query}
          onChange={onQueryChange}
          onSubmit={commit}
          suggestions={commentTexts}
          completions={query.trim() ? completions(query, parsed, counterparties) : []}
        />
        {clearable(
          <Chip
            variant="dropdown"
            isSelected={Boolean(effective.direction)}
            value={directionLabel}
            popupContent={DIRECTIONS.map((d) => (
              <Cell key={d.label} title={d.label} verticalPadding="2x" onClick={() => setDirection(d.value)} />
            ))}
          >
            {directionLabel}
          </Chip>,
          Boolean(effective.direction),
          () => setDirection(undefined),
          directionLabel,
        )}
        {clearable(
        <Chip
          variant="dropdown"
          isSelected={Boolean(effective.period)}
          value={effective.period?.label ?? 'За всё время'}
          popupContent={[{ label: 'За всё время' }, ...periodOptions()].map((p) => (
            <Cell
              key={p.label}
              title={p.label}
              verticalPadding="2x"
              onClick={() => setPeriod('from' in p ? (p as FilterState['period']) : undefined)}
            />
          ))}
        >
          {effective.period?.label ?? 'За всё время'}
        </Chip>,
          Boolean(effective.period),
          () => setPeriod(undefined),
          effective.period?.label ?? '',
        )}
        <Chip variant="dropdown">Категория</Chip>
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
              <DayTotals payments={day.payments} />
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
