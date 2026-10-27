import React from 'react';
import { Button, Chip, Widget } from '@pluginwoman/t-ds';
import { Payment } from '../../data';
import { CompactSearch } from '../CompactSearch';
import { PaymentRow } from '../PaymentRow';
import { historyQuickActions } from '../PaymentHistory';

type Direction = 'all' | 'in' | 'out';

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'in', label: 'Входящие' },
  { value: 'out', label: 'Исходящие' },
];

/** Сколько последних операций в виджете */
const LATEST_LIMIT = 5;

interface HistoryWidgetProps {
  payments: Payment[];
  comments: Record<string, string>;
  selectedId?: string;
  onOpenPayment: (payment: Payment) => void;
  onComment: (payment: Payment) => void;
  /** «Операции» с запросом — полный результат поиска, клик по тегу, «Все операции» */
  onOpenOperations: (tab: 'all' | 'sign', query?: string) => void;
}

/** Виджет «История»: быстрые фильтры, поиск с саджестами и 5 последних операций */
export const HistoryWidget: React.FC<HistoryWidgetProps> = ({
  payments,
  comments,
  selectedId,
  onOpenPayment,
  onComment,
  onOpenOperations,
}) => {
  const [direction, setDirection] = React.useState<Direction>('all');
  const latest = payments
    .filter((p) => (direction === 'in' ? p.sum > 0 : direction === 'out' ? p.sum < 0 : true))
    .slice(0, LATEST_LIMIT);

  return (
    <Widget
      title="История"
      hasChevron={false}
      hasDescription={false}
      hasRightAccessory={false}
      minContentHeight={0}
      className="home-widget"
      contentClassName="history-widget"
    >
      <div className="history-widget__filters">
        <div className="history-widget__chips">
          {DIRECTIONS.map((item) => (
            <Chip key={item.value} variant="tab" isSelected={direction === item.value} onClick={() => setDirection(item.value)}>
              {item.label}
            </Chip>
          ))}
        </div>
        <CompactSearch
          payments={payments}
          comments={comments}
          onOpenPayment={onOpenPayment}
          onShowAll={(query) => onOpenOperations('all', query)}
        />
      </div>

      <div className="history-widget__list">
        {latest.map((payment) => (
          <PaymentRow
            key={payment.id}
            payment={payment}
            comment={comments[payment.id]}
            isSelected={payment.id === selectedId}
            isCompact
            isSmall
            quickActions={historyQuickActions(payment, comments[payment.id], onComment)}
            onSelect={() => onOpenPayment(payment)}
            onTagClick={(comment) => onOpenOperations('all', comment)}
          />
        ))}
        {latest.length === 0 && <p className="ts-400-m history-card__empty">Операций пока нет</p>}
      </div>

      <Button variant="secondary" size="s" className="history-widget__all" onClick={() => onOpenOperations('all')}>
        Все операции
      </Button>
    </Widget>
  );
};
