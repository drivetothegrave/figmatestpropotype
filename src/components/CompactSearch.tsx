import React from 'react';
import ReactDOM from 'react-dom';
import { Cell, CellRightAccessory, Search } from '@pluginwoman/t-ds';
import { Magnifier } from '@pluginwoman/t-ds/icons';
import { Payment, formatAmount } from '../data';
import { matchSuggestions } from '../suggest';
import { completions, isSmart, parseQuery, smartMatches, summarize } from '../smartQuery';
import { SmartTotal } from './SmartSummary';

interface CompactSearchProps {
  payments: Payment[];
  comments: Record<string, string>;
  /** Открыть платёж в дровере прямо на главной */
  onOpenPayment: (payment: Payment) => void;
  /** Перейти в «Операции» с этим запросом — полный результат */
  onShowAll: (query: string) => void;
}

const PREVIEW_LIMIT = 3;

type Item =
  | { kind: 'complete'; text: string }
  | { kind: 'comment'; text: string }
  | { kind: 'payment'; payment: Payment }
  | { kind: 'all'; count: number };

/**
 * Поиск в компактной истории на главной.
 * В выпадашке: подсказки из комментариев, 3 найденные операции и «Показать все результаты (N)».
 * Enter, «Показать все» или выбор комментария — переход в «Операции» с этим запросом.
 */
export const CompactSearch: React.FC<CompactSearchProps> = ({ payments, comments, onOpenPayment, onShowAll }) => {
  const [query, setQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [position, setPosition] = React.useState<{ top: number; left: number; width: number }>();
  const ref = React.useRef<HTMLDivElement>(null);

  const q = query.trim();
  // «Умный» разбор: «входящие за май от 50 тыс» → фильтры + остаток текста
  const counterparties = payments.map((p) => p.counterparty);
  const parsed = parseQuery(q, counterparties);
  const smart = isSmart(parsed);
  const found = q ? payments.filter((p) => smartMatches(p, comments[p.id], parsed)) : [];
  const total = summarize(found);
  const hints = q ? completions(query, parsed, counterparties) : [];
  const commentHints =
    q && !smart ? matchSuggestions(Array.from(new Set(Object.values(comments))), q, 3).filter((c) => c !== q) : [];

  const items: Item[] = q
    ? [
        ...hints.map((text) => ({ kind: 'complete' as const, text })),
        ...commentHints.map((text) => ({ kind: 'comment' as const, text })),
        ...found.slice(0, PREVIEW_LIMIT).map((payment) => ({ kind: 'payment' as const, payment })),
        ...(found.length > 0 ? [{ kind: 'all' as const, count: found.length }] : []),
      ]
    : [];
  const isOpen = isFocused && q !== '';

  React.useEffect(() => setActiveIndex(-1), [q]);

  React.useLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        // Выпадашка шире поля (в макете 680px), прижата к правому краю поля и не вылезает за экран
        const width = Math.min(Math.max(rect.width, 600), rect.right - 16);
        setPosition({ top: rect.bottom, left: rect.right - width, width });
      }
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen]);

  const choose = (item: Item) => {
    if (item.kind === 'complete') {
      // Дополняем запрос и остаёмся в поиске — видно, как изменился результат
      setQuery(item.text + ' ');
      return;
    }
    if (item.kind === 'payment') {
      onOpenPayment(item.payment);
      (document.activeElement as HTMLElement | null)?.blur();
    } else if (item.kind === 'comment') {
      onShowAll(item.text);
    } else {
      onShowAll(q);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown' && items.length) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp' && items.length) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Enter без выбора — сразу полный результат в «Операциях»
      if (activeIndex >= 0) choose(items[activeIndex]);
      else onShowAll(q);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      (document.activeElement as HTMLElement | null)?.blur();
    }
  };

  const itemClass = (index: number, extra = '') =>
    ['suggest-popup__item', extra, index === activeIndex ? 'is-active' : ''].filter(Boolean).join(' ');

  const renderItem = (item: Item, index: number) => {
    if (item.kind === 'complete' || item.kind === 'comment') {
      return (
        <Cell
          key={`${item.kind}-${item.text}`}
          className={itemClass(index)}
          title={item.text.charAt(0).toUpperCase() + item.text.slice(1)}
          titleClassName="ts-500-m"
          verticalPadding="2x"
          leftAccessory={
            <span className="ds-icon ds-icon--m compact-search__hint-icon" aria-hidden="true">
              <Magnifier />
            </span>
          }
          onClick={() => choose(item)}
        />
      );
    }
    if (item.kind === 'payment') {
      return (
        <Cell
          key={`p-${item.payment.id}`}
          className={itemClass(index)}
          title={item.payment.counterparty}
          titleClassName="ts-500-m"
          description={comments[item.payment.id] ?? item.payment.description}
          descriptionClassName="ts-400-s compact-search__ellipsis"
          verticalPadding="2x"
          rightAccessory={
            <span className={item.payment.sum > 0 ? 'compact-search__amount--income' : undefined}>
              <CellRightAccessory variant="text-m" text={formatAmount(item.payment.sum, item.payment.currency)} />
            </span>
          }
          onClick={() => choose(item)}
        />
      );
    }
    return (
      <Cell
        key="all"
        className={itemClass(index)}
        title={`Все результаты  ·  ${item.count}`}
        titleClassName="ts-500-s"
        titleColor="var(--primitive-brand)"
        verticalPadding="2x"
        onClick={() => choose(item)}
      />
    );
  };

  /** Группа выпадашки по макету «Результаты поиска»: подсказки / операции / все результаты */
  const renderGroup = (entries: { item: Item; index: number }[], title?: string) =>
    entries.length > 0 && (
      <div className="compact-search__group">
        {title && <p className="ts-500-s compact-search__group-title">{title}</p>}
        {entries.map(({ item, index }) => renderItem(item, index))}
      </div>
    );

  return (
    <div
      ref={ref}
      className="history-card__search compact-search"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={onKeyDown}
    >
      <Search value={query} onChange={setQuery} placeholder="Контрагент, сумма, назначение" />

      {isOpen &&
        position &&
        ReactDOM.createPortal(
          <div
            className="suggest-popup compact-search__popup"
            role="listbox"
            style={{ top: position.top, left: position.left, width: position.width }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {found.length > 0 ? (
              <SmartTotal
                className="compact-search__summary"
                count={total.count}
                income={total.income}
                expense={total.expense}
              />
            ) : (
              <p className="ts-500-s compact-search__summary">Ничего не нашлось</p>
            )}
            {renderGroup(
              items.flatMap((item, index) => (item.kind === 'complete' || item.kind === 'comment' ? [{ item, index }] : [])),
            )}
            {renderGroup(
              items.flatMap((item, index) => (item.kind === 'payment' ? [{ item, index }] : [])),
              'Операции',
            )}
            {renderGroup(items.flatMap((item, index) => (item.kind === 'all' ? [{ item, index }] : [])))}
          </div>,
          document.body,
        )}
    </div>
  );
};
