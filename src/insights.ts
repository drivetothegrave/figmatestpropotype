/**
 * Инсайд-нотификация на главной — одна за раз и только «в нужный момент».
 * В прототипе момент выбирается в панели настроек.
 */
export type InsightNotice = 'off' | 'duplicate' | 'revenue' | 'risk-medium' | 'risk-high';

/** Режимы риска — карточка риска в «Операциях» */
export type RiskMode = 'low' | 'medium' | 'high';

export interface InsightSettings {
  notice: InsightNotice;
  /** Рекомендация «Откладывайте на налоги 7%» внутри таймлайна */
  recommendation: boolean;
}

export const DEFAULT_INSIGHTS: InsightSettings = {
  notice: 'duplicate',
  recommendation: false,
};

export const NOTICE_LABEL: Record<InsightNotice, string> = {
  off: 'Нет',
  duplicate: 'Дубль',
  revenue: 'Выручка выросла',
  'risk-medium': 'Риск вырос',
  'risk-high': 'Высокий риск',
};

export const NOTICE_INFO: Record<Exclude<InsightNotice, 'off'>, {
  tone: 'brand' | 'success' | 'warning' | 'error';
  title: string;
  text: string;
}> = {
  duplicate: {
    tone: 'brand',
    title: 'Похоже на дубль.',
    text: 'Два платежа БЦ Лесная, ООО с комментарием «Аренда офиса» ждут подписания.',
  },
  revenue: {
    tone: 'success',
    title: 'Выручка выросла на 20% на этой неделе.',
    text: 'Поступило 1,8 млн за 7 дней.',
  },
  'risk-medium': {
    tone: 'warning',
    title: 'Риск по операциям вырос до среднего.',
    text: 'Повлияли 3 последних платежа.',
  },
  'risk-high': {
    tone: 'error',
    title: 'Высокий риск по операциям.',
    text: 'Банк может запросить документы по последним платежам.',
  },
};

/** Риск в «Операциях» следует за нотификацией о риске */
export const riskOf = (notice: InsightNotice): RiskMode =>
  notice === 'risk-high' ? 'high' : notice === 'risk-medium' ? 'medium' : 'low';

export const RISK_INFO: Record<RiskMode, { title: string; description: string; level: number; color: string }> = {
  low: {
    title: 'Низкий риск по операциям',
    description: 'Беспокоиться не о чем',
    level: 1,
    color: 'var(--primitive-success)',
  },
  medium: {
    title: 'Риск по операциям повысился',
    description: 'Проверьте назначения последних платежей',
    level: 2,
    color: 'var(--primitive-warning)',
  },
  high: {
    title: 'Высокий риск по операциям',
    description: 'Банк может запросить документы',
    level: 3,
    color: 'var(--primitive-error)',
  },
};
