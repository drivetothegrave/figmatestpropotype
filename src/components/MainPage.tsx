import React from 'react';
import { Avatar, Button, Search, TabsCarousel, Tag } from '@pluginwoman/t-ds';
import { DotsThreeHorizontal, Plus } from '@pluginwoman/t-ds/icons';
import { Payment, formatRub } from '../data';
import { CompactSearch } from './CompactSearch';
import { PaymentRow } from './PaymentRow';
import { historyQuickActions } from './PaymentHistory';
import { InsightSettings, RISK_INFO } from '../insights';

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
  /** Какие инсайды и рекомендации показывать — из настроек прототипа */
  insights: InsightSettings;
}

type InsightTone = 'brand' | 'warning' | 'error' | 'success' | 'neutral';

/** Инсайд-плашка над компактным таймлайном (Tag с индикатором) */
const Insight: React.FC<{ tone: InsightTone; onClick: () => void; children: React.ReactNode }> = ({
  tone,
  onClick,
  children,
}) => (
  <button type="button" className={`insight insight--${tone} hoverOpacity`} onClick={onClick}>
    <Tag shape="circle" size="xl" className="insight__tag">
      <span className="insight__content">
        <span className="insight__dot" aria-hidden="true" />
        {children}
      </span>
    </Tag>
  </button>
);

/** Экран «Компактный таймлайн»: выжимка последних операций, инсайды и поиск */
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
}) => {
  const [isRecommendationHidden, setIsRecommendationHidden] = React.useState(false);
  // Если рекомендацию снова включили в настройках — показываем, даже если её скрывали
  React.useEffect(() => {
    if (insights.recommendation) setIsRecommendationHidden(false);
  }, [insights.recommendation]);

  const insightItems: { key: string; tone: InsightTone; label: React.ReactNode; onClick: () => void }[] = [];
  if (insights.sign && signCount > 0) {
    insightItems.push({
      key: 'sign',
      tone: 'brand',
      label: `${signCount} на подпись · ${formatRub(signSum)}`,
      onClick: () => onOpenOperations('sign'),
    });
  }
  if (insights.risk !== 'off') {
    const risk = RISK_INFO[insights.risk];
    insightItems.push({ key: 'risk', tone: risk.tone, label: risk.insight, onClick: () => onOpenOperations('all') });
  }
  if (insights.income) {
    insightItems.push({
      key: 'income',
      tone: 'success',
      label: 'Поступления +18% к прошлой неделе',
      onClick: () => onOpenOperations('all'),
    });
  }
  const [globalQuery, setGlobalQuery] = React.useState('');
  const latest = payments.slice(0, LATEST_LIMIT);

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

      <section className="main-page__section">
        <h2 className="ts-600-2xl main-page__title">История операций</h2>

        <div className="compact-timeline">
          <div className="compact-timeline__filters">
            <CompactSearch
              payments={payments}
              comments={comments}
              onOpenPayment={onOpenPayment}
              onShowAll={(query) => onOpenOperations('all', query)}
            />
            {insightItems.length > 0 && (
              <div className="compact-timeline__insights">
                {insightItems.map((item) => (
                  <Insight key={item.key} tone={item.tone} onClick={item.onClick}>
                    {item.label}
                  </Insight>
                ))}
              </div>
            )}
          </div>

          <div className="compact-timeline__list">
            {latest.slice(0, 1).map(row)}

            {insights.recommendation && !isRecommendationHidden && (
              <div className="timeline-banner">
                <span className="ts-500-s timeline-banner__label">Рекомендация</span>
                <div className="timeline-banner__content">
                  <p className="ts-400-s">
                    Откладывайте на налоги 7% поступлений, чтобы не искать деньги в последний момент. Готовы
                    отложить 37 500 ₽?
                  </p>
                  <div className="timeline-banner__buttons">
                    <Button variant="secondary" size="xs" isHugWidth className="timeline-banner__brand-button">
                      Отложить в фонд
                    </Button>
                    <Button variant="secondary" size="xs" isHugWidth onClick={() => setIsRecommendationHidden(true)}>
                      Скрыть
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {latest.slice(1).map(row)}
          </div>

          <Button variant="secondary" size="s" className="compact-timeline__all" onClick={() => onOpenOperations('all')}>
            Все операции
          </Button>
        </div>
      </section>
    </div>
  );
};
