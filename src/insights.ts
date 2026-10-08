/** Режимы риска по операциям — переключаются в настройках прототипа */
export type RiskMode = 'off' | 'low' | 'medium' | 'high';

/** Что показываем на главной — настраивается в панели прототипа */
export interface InsightSettings {
  /** «N на подпись · сумма» */
  sign: boolean;
  risk: RiskMode;
  /** «Поступления +18% к прошлой неделе» */
  income: boolean;
  /** Рекомендация «Откладывайте на налоги 7%» внутри таймлайна */
  recommendation: boolean;
}

export const DEFAULT_INSIGHTS: InsightSettings = {
  sign: true,
  risk: 'medium',
  income: false,
  recommendation: true,
};

export const RISK_INFO: Record<Exclude<RiskMode, 'off'>, {
  insight: string;
  tone: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  level: number;
  color: string;
}> = {
  low: {
    insight: 'Низкий риск',
    tone: 'success',
    title: 'Низкий риск по операциям',
    description: 'Беспокоиться не о чем',
    level: 1,
    color: 'var(--primitive-success)',
  },
  medium: {
    insight: 'Риск повысился',
    tone: 'warning',
    title: 'Риск по операциям повысился',
    description: 'Проверьте назначения последних платежей',
    level: 2,
    color: 'var(--primitive-warning)',
  },
  high: {
    insight: 'Высокий риск',
    tone: 'error',
    title: 'Высокий риск по операциям',
    description: 'Банк может запросить документы',
    level: 3,
    color: 'var(--primitive-error)',
  },
};

export const RISK_LABEL: Record<RiskMode, string> = {
  off: 'Выкл',
  low: 'Низкий',
  medium: 'Повысился',
  high: 'Высокий',
};
