import React from 'react';
import { Cell, LinearProgress, TabsCarousel } from '@pluginwoman/t-ds';
import { ArrowDownUnderline } from '@pluginwoman/t-ds/icons';
import { RISK_INFO, RiskMode } from '../insights';

export type OperationsTab = 'all' | 'sign' | 'drafts';

const TAB_ORDER: OperationsTab[] = ['all', 'sign', 'drafts'];

// Столбики «Выручка по месяцам» — доля от максимума шкалы (2,5 млн)
const REVENUE_BARS = [
  { month: 'Май', value: 0.2 },
  { month: 'Июн', value: 0.5 },
  { month: 'Июль', value: 0.7 },
  { month: 'Авг', value: 0.6 },
  { month: 'Сен', value: 0.4 },
  { month: 'Окт', value: 0.6 },
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

                  <div className="bar-graph" aria-label="Выручка по месяцам">
                    <div className="bar-graph__legend ts-400-xxs">
                      <span>2,5 млн</span>
                      <span>0</span>
                    </div>
                    <div className="bar-graph__bars">
                      {REVENUE_BARS.map((bar) => (
                        <div key={bar.month} className="bar-graph__column">
                          <div className="bar-graph__track">
                            <div className="bar-graph__bar" style={{ height: `${bar.value * 100}%` }} />
                          </div>
                          <span className="ts-400-xxs bar-graph__label">{bar.month}</span>
                        </div>
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
