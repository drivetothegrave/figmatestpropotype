import React from 'react';
import { Checkbox, Chip, Footer, IconButton } from '@pluginwoman/t-ds';
import { BubbleListShort, Pen } from '@pluginwoman/t-ds/icons';
import { Filters } from '@pluginwoman/t-ds/icons/20/Stroked';
import { Payment, PaymentDay, formatRub, paymentsWord } from '../data';
import { filterDays, paymentMatches } from '../suggest';
import { PaymentRow, QuickAction } from './PaymentRow';
import { SearchWithSuggest } from './SearchWithSuggest';
import { PaymentTableRow } from './PaymentTableRow';
import { ViewToggle } from './ViewToggle';
import { DayTotals } from './PaymentHistory';

// На подпись нужны только период и счёт
const FILTERS = ['За всё время', 'Счёт'];

interface SignListProps {
  /** Только платежи со статусом «На подпись» */
  days: PaymentDay[];
  comments: Record<string, string>;
  selectedId?: string;
  /** Сообщение после подписания — по нему сбрасываем поиск и выбор */
  successMessage?: string;
  onSelect: (payment: Payment) => void;
  onComment: (payment: Payment) => void;
  /** Запросить подписание — App покажет подтверждение */
  onSign: (payments: Payment[]) => void;
  /** Вид списка общий для вкладок «Операций» */
  isCompactView: boolean;
  onViewChange: (isCompact: boolean) => void;
}

const sumOf = (payments: Payment[]) => payments.reduce((acc, p) => acc + Math.abs(p.sum), 0);

/**
 * Экран «Платежи на подпись».
 * Сценарий руководителя: найти платежи по комментарию (поиск с подсказками или клик по тегу) —
 * заголовок и кнопка пересчитываются по видимым платежам, и подписываются ровно они.
 * «Выбрать» включает ручной выбор чекбоксами.
 */
export const SignList: React.FC<SignListProps> = ({
  days,
  comments,
  selectedId,
  successMessage,
  onSelect,
  onComment,
  onSign,
  isCompactView,
  onViewChange,
}) => {
  const [query, setQuery] = React.useState('');
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [checked, setChecked] = React.useState<Set<string>>(new Set());

  const allPayments = days.flatMap((day) => day.payments);
  const visibleDays = filterDays(days, (payment) => paymentMatches(payment, comments[payment.id], query));
  const visible = visibleDays.flatMap((day) => day.payments);

  // Подписанные платежи исчезают из списка — убираем их и из выбора
  React.useEffect(() => {
    const ids = new Set(allPayments.map((p) => p.id));
    setChecked((prev) => {
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [allPayments.map((p) => p.id).join()]);

  // После подписания сбрасываем поиск и режим выбора
  React.useEffect(() => {
    if (successMessage) {
      setQuery('');
      setIsSelecting(false);
      setChecked(new Set());
    }
  }, [successMessage]);

  const selected = visible.filter((p) => checked.has(p.id));
  const toSign = isSelecting ? selected : visible;
  const isFiltered = query.trim() !== '';

  const toggle = (id: string, value: boolean) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });

  const allVisibleChecked = visible.length > 0 && visible.every((p) => checked.has(p.id));

  const quickActions = (payment: Payment): QuickAction[] => [
    { tooltip: 'Подписать', label: 'Подписать платёж', icon: <Pen />, onClick: () => onSign([payment]) },
    {
      tooltip: 'Комментарий',
      label: comments[payment.id] ? 'Изменить комментарий' : 'Оставить комментарий',
      icon: <BubbleListShort />,
      onClick: () => onComment(payment),
    },
  ];

  const footerLabel = isSelecting
    ? selected.length > 0
      ? `Подписать ${paymentsWord(selected.length)} на ${formatRub(sumOf(selected))}`
      : 'Выберите платежи'
    : isFiltered
      ? `Подписать ${paymentsWord(visible.length)} на ${formatRub(sumOf(visible))}`
      : 'Подписать всё';

  return (
    <div className="history-card sign-list">
      <div className="history-card__filters">
        <IconButton icon={<Filters />} ariaLabel="Фильтры" variant="secondary" size="xs" />
        <SearchWithSuggest
          value={query}
          onChange={setQuery}
          suggestions={allPayments.map((p) => comments[p.id]).filter((c): c is string => Boolean(c))}
          placeholder="Контрагент, сумма, комментарий"
        />
        {FILTERS.map((label) => (
          <Chip key={label} variant="dropdown">
            {label}
          </Chip>
        ))}
        <Chip
          variant="chip"
          isSelected={isSelecting}
          isDisabled={visible.length === 0}
          onClick={() => {
            if (isSelecting) {
              setIsSelecting(false);
              setChecked(new Set());
            } else {
              setIsSelecting(true);
            }
          }}
        >
          {isSelecting ? 'Отменить' : 'Выбрать'}
        </Chip>
        <ViewToggle isCompact={isCompactView} onChange={onViewChange} />
      </div>

      {allPayments.length === 0 ? (
        <p className="ts-400-m history-card__empty">Все платежи подписаны</p>
      ) : (
        <>
          <div className="sign-list__summary">
            {isSelecting && visible.length > 0 && (
              <Checkbox
                isChecked={allVisibleChecked}
                isIndeterminate={!allVisibleChecked && selected.length > 0}
                onChange={(value) => setChecked(value ? new Set(visible.map((p) => p.id)) : new Set())}
                label="Выбрать все"
              />
            )}
            <h2 className="ts-600-2xl">
              {visible.length > 0 ? `${paymentsWord(visible.length)} на ${formatRub(sumOf(visible))}` : 'Ничего не нашлось'}
            </h2>
          </div>

          {isFiltered && visible.length > 0 && (
            <p className="ts-400-s sign-list__hint">
              Показаны платежи по запросу «{query.trim()}» — подпишутся только они.{' '}
              <button type="button" className="sign-list__link ts-500-s hoverOpacity" onClick={() => setQuery('')}>
                Показать все {paymentsWord(allPayments.length)}
              </button>
            </p>
          )}

          {visibleDays.map((day) => {
            const dayIds = day.payments.map((p) => p.id);
            const dayChecked = dayIds.filter((id) => checked.has(id)).length;
            return (
              <section key={day.title} className="history-day">
                <div className="history-day__header">
                  {isSelecting && (
                    <Checkbox
                      isChecked={dayChecked === dayIds.length}
                      isIndeterminate={dayChecked > 0 && dayChecked < dayIds.length}
                      onChange={(value) => dayIds.forEach((id) => toggle(id, value))}
                      label={`Выбрать все платежи за ${day.title}`}
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
                    hasStatus: false,
                    leading: isSelecting ? (
                      <Checkbox
                        isChecked={checked.has(payment.id)}
                        onChange={(value) => toggle(payment.id, value)}
                        label={`Выбрать платёж ${payment.counterparty}`}
                      />
                    ) : undefined,
                    quickActions: quickActions(payment),
                    onSelect: () => (isSelecting ? toggle(payment.id, !checked.has(payment.id)) : onSelect(payment)),
                    onTagClick: setQuery,
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

          {visible.length > 0 && (
            <Footer
              className="sign-list__footer"
              layout="1-button"
              primaryAction={{
                label: footerLabel,
                isDisabled: toSign.length === 0,
                onClick: () => onSign(toSign),
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
