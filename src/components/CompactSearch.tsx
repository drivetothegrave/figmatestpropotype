import React from 'react';
import ReactDOM from 'react-dom';
import { Cell, CellRightAccessory, Search } from '@pluginwoman/t-ds';
import { Magnifier } from '@pluginwoman/t-ds/icons';
import { Payment, formatAmount } from '../data';
import { matchSuggestions } from '../suggest';
import { completions, isSmart, parseQuery, smartMatches, summarize } from '../smartQuery';
import { SmartSummary } from './SmartSummary';

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
        // Выпадашка не уже 440px — блок «Понял как» помещается; прижимаем к правому краю поля
        const width = Math.max(rect.width, 440);
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
            {smart && (
              <SmartSummary
                className="compact-search__summary"
                tokens={parsed.tokens}
                text={parsed.text}
                count={total.count}
                income={total.income}
                expense={total.expense}
              />
            )}
            {!smart && items.length === 0 && (
              <p className="ts-400-m compact-search__empty">Ничего не нашлось</p>
            )}
            {items.map((item, index) => {
              if (item.kind === 'complete') {
                return (
                  <Cell
                    key={`h-${item.text}`}
                    className={itemClass(index)}
                    title={item.text}
                    titleClassName="ts-400-m"
                    verticalPadding="2x"
                    leftAccessory={
                      <span className="ds-icon ds-icon--s compact-search__hint-icon" aria-hidden="true">
                        <Magnifier />
                      </span>
                    }
                    onClick={() => choose(item)}
                  />
                );
              }
              if (item.kind === 'comment') {
                return (
                  <Cell
                    key={`c-${item.text}`}
                    className={itemClass(index)}
                    title={item.text}
                    titleClassName="ts-400-m"
                    verticalPadding="2x"
                    leftAccessory={
                      <span className="ds-icon ds-icon--s compact-search__hint-icon" aria-hidden="true">
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
                    description={comments[item.payment.id] ?? item.payment.description}
                    verticalPadding="2x"
                    rightAccessory={<CellRightAccessory variant="text-m" text={formatAmount(item.payment.sum, item.payment.currency)} />}
                    onClick={() => choose(item)}
                  />
                );
              }
              return (
                <Cell
                  key="all"
                  className={itemClass(index, 'compact-search__all')}
                  title={`Показать все результаты · ${item.count}`}
                  titleClassName="ts-500-m"
                  titleColor="var(--primitive-brand)"
                  verticalPadding="2x"
                  onClick={() => choose(item)}
                />
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};
