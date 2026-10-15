import React from 'react';
import { Avatar, Button, Chip, Search, TabsCarousel } from '@pluginwoman/t-ds';
import { DotsThreeHorizontal, Plus } from '@pluginwoman/t-ds/icons';
import { Payment } from '../data';
import { CompactSearch } from './CompactSearch';
import { PaymentRow } from './PaymentRow';
import { historyQuickActions } from './PaymentHistory';
import { InsightSettings } from '../insights';
import { InsightNoticeBanner, RecommendationBanner, TaskChips } from './InsightBanners';

type Direction = 'all' | 'in' | 'out';

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'in', label: 'Входящие' },
  { value: 'out', label: 'Исходящие' },
];

const ACCOUNTS = [
  { name: 'Расчётный, **6584', balance: '23 422 785,37 ₽' },
  { name: 'Операционный, **8934', balance: '2 374,77 ₽' },
];

/** Сколько последних операций показываем на главной */
const LATEST_LIMIT = 5;

interface MainPageProps {
  payments: Payment[];
  comments: Record<string, string>;
  signCount: number;
  signSum: number;
  selectedId?: string;
  onOpenPayment: (payment: Payment) => void;
  onComment: (payment: Payment) => void;
  /** Перейти в «Операции»: вкладка и (опционально) поисковый запрос */
  onOpenOperations: (tab: 'all' | 'sign', query?: string) => void;
  /** Какая нотификация и рекомендация показываются — из настроек прототипа */
  insights: InsightSettings;
  /** Полный таймлайн (настройка прототипа) — заменяет компактную историю */
  timeline?: React.ReactNode;
}

/** Главная: «Компактный таймлайн» (выжимка, инсайды, поиск) или полный таймлайн — по настройке */
export const MainPage: React.FC<MainPageProps> = ({
  payments,
  comments,
  signCount,
  signSum,
  selectedId,
  onOpenPayment,
  onComment,
  onOpenOperations,
  insights,
  timeline,
}) => {
  const vedPayments = payments.filter((p) => p.status === 'docs');

  // Быстрый фильтр по направлению — фильтрует список прямо на главной
  const [direction, setDirection] = React.useState<Direction>('all');

  const [globalQuery, setGlobalQuery] = React.useState('');
  const latest = payments
    .filter((p) => (direction === 'in' ? p.sum > 0 : direction === 'out' ? p.sum < 0 : true))
    .slice(0, LATEST_LIMIT);

  const row = (payment: Payment) => (
    <PaymentRow
      key={payment.id}
      payment={payment}
      comment={comments[payment.id]}
      isSelected={payment.id === selectedId}
      isCompact
      quickActions={historyQuickActions(payment, comments[payment.id], onComment)}
      onSelect={() => onOpenPayment(payment)}
      onTagClick={(comment) => onOpenOperations('all', comment)}
    />
  );

  return (
    <div className="main-page">
      {/* Поиск по Точке — по Enter ищем в операциях */}
      <form
        className="main-page__global-search"
        onSubmit={(e) => {
          e.preventDefault();
          if (globalQuery.trim()) onOpenOperations('all', globalQuery.trim());
        }}
      >
        <Search value={globalQuery} onChange={setGlobalQuery} placeholder="Поиск по Точке" />
      </form>

      <section className="main-page__section">
        <TabsCarousel
          size="2xl"
          className="main-page__tabs"
          hasAction
          actionLabel="Добавить"
          actionIcon={<Plus />}
          tabs={[{ label: 'Счета' }, { label: 'Фонды' }, { label: 'Карты' }]}
        />
        <div className="accounts">
          {ACCOUNTS.map((account) => (
            <div key={account.name} className="account-card">
              <div className="account-card__header">
                <Avatar size={24} shape="circle" label="₽" />
                <span className="ts-400-s account-card__name">{account.name}</span>
                <span className="ds-icon ds-icon--m" aria-hidden="true">
                  <DotsThreeHorizontal />
                </span>
              </div>
              <span className="ts-500-xl">{account.balance}</span>
            </div>
          ))}
        </div>
      </section>

      {timeline ? (
        <section className="main-page__section main-page__timeline">{timeline}</section>
      ) : (
        <section className="main-page__section">
          <h2 className="ts-600-2xl main-page__title">История операций</h2>

          <div className="compact-timeline">
            <div className="compact-timeline__filters">
              <div className="compact-timeline__chips">
                {DIRECTIONS.map((item) => (
                  <Chip
                    key={item.value}
                    variant="tab"
                    isSelected={direction === item.value}
                    onClick={() => setDirection(item.value)}
                  >
                    {item.label}
                  </Chip>
                ))}
                <TaskChips
                  insights={insights}
                  signCount={signCount}
                  signSum={signSum}
                  vedPayments={vedPayments}
                  onOpenSign={() => onOpenOperations('sign')}
                  onOpenVed={(payment) => onOpenOperations('all', payment.counterparty)}
                />
              </div>
              <CompactSearch
                payments={payments}
                comments={comments}
                onOpenPayment={onOpenPayment}
                onShowAll={(query) => onOpenOperations('all', query)}
              />
            </div>

            <InsightNoticeBanner insights={insights} />

            <div className="compact-timeline__list">
              {latest.slice(0, 1).map(row)}

              <RecommendationBanner insights={insights} />

              {latest.slice(1).map(row)}
              {latest.length === 0 && <p className="ts-400-m history-card__empty">Операций пока нет</p>}
            </div>

            <Button variant="secondary" size="s" className="compact-timeline__all" onClick={() => onOpenOperations('all')}>
              Все операции
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};
