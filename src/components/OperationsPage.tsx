import React from 'react';
import { Cell, LinearProgress, TabsCarousel } from '@pluginwoman/t-ds';
import { ArrowDownUnderline } from '@pluginwoman/t-ds/icons';
import { RISK_INFO, RiskMode } from '../insights';
import { formatRub } from '../data';
import { AreaChart } from './AreaChart';

export type OperationsTab = 'all' | 'sign' | 'drafts';

const TAB_ORDER: OperationsTab[] = ['all', 'sign', 'drafts'];

// «Выручка по месяцам» — доля от максимума шкалы (2,5 млн)
const REVENUE_SCALE = 2_500_000;
const REVENUE_BARS = [
  { month: 'Май', short: 'Май', value: 0.2 },
  { month: 'Июнь', short: 'Июн', value: 0.5 },
  { month: 'Июль', short: 'Июль', value: 0.7 },
  { month: 'Август', short: 'Авг', value: 0.6 },
  { month: 'Сентябрь', short: 'Сен', value: 0.4 },
  { month: 'Октябрь', short: 'Окт', value: 0.6 },
];

interface OperationsPageProps {
  tab: OperationsTab;
  onTabChange: (tab: OperationsTab) => void;
  signCount: number;
  history: React.ReactNode;
  signList: React.ReactNode;
  /** Режим риска — следует за нотификацией о риске на главной */
  risk: RiskMode;
}

/** Экран «Развёрнутый таймлайн» — отдельная страница «Операции» */
export const OperationsPage: React.FC<OperationsPageProps> = ({ tab, onTabChange, signCount, history, signList, risk }) => {
  const riskInfo = RISK_INFO[risk] ?? RISK_INFO.low;
  return (
  <div className="operations-page">
    <TabsCarousel
      size="2xl"
      className="history-tabs operations-page__tabs"
      selectedIndex={TAB_ORDER.indexOf(tab)}
      onTabChange={(index) => onTabChange(TAB_ORDER[index])}
      hasAction
      actionLabel="Скачать выписку"
      actionIcon={<ArrowDownUnderline />}
      tabs={[
        {
          label: 'Все операции',
          content: (
            <>
              <div className="operations-analytics">
                <div className="analytics-card analytics-card--revenue">
                  <div className="analytics-card__stats">
                    <div className="analytics-stat">
                      <span className="ts-400-s analytics-stat__label">Выручка в октябре</span>
                      <span className="ts-600-m analytics-stat__value--success">250 000 ₽</span>
                    </div>
                    <div className="analytics-stat">
                      <span className="ts-400-s analytics-stat__label">Поступления</span>
                      <span className="ts-600-m">+ 1 240 000 ₽</span>
                    </div>
                    <div className="analytics-stat">
                      <span className="ts-400-s analytics-stat__label">Списания</span>
                      <span className="ts-600-m">– 250 000 ₽</span>
                    </div>
                  </div>

                  {/* Выручка по месяцам — линией, как график в «Финансах» на главной */}
                  <div className="analytics-chart" aria-label="Выручка по месяцам">
                    <AreaChart
                      values={REVENUE_BARS.map((bar) => bar.value)}
                      labels={REVENUE_BARS.map((bar) => `${bar.month} 2026`)}
                      formatValue={(i) => formatRub(Math.round(REVENUE_BARS[i].value * REVENUE_SCALE))}
                    />
                    <div className="ts-400-xxs analytics-chart__axis">
                      {REVENUE_BARS.map((bar) => (
                        <span key={bar.month}>{bar.short}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="analytics-card analytics-card--risk">
                  <Cell title={riskInfo.title} titleClassName="ts-500-s" verticalPadding="none" />
                  <LinearProgress
                    variant="steps"
                    value={riskInfo.level}
                    maxSteps={3}
                    progressColor={riskInfo.color}
                    trackColor="var(--translucent-primitives-neutral-1)"
                  />
                  <span className="ts-400-xs analytics-stat__label">{riskInfo.description}</span>
                </div>
              </div>
              {history}
            </>
          ),
        },
        { label: 'На подпись', badge: signCount > 0 ? signCount : undefined, content: signList },
        {
          label: 'Черновики',
          content: <div className="history-card history-card__empty ts-400-m">Черновиков пока нет</div>,
        },
      ]}
    />
  </div>
  );
};
