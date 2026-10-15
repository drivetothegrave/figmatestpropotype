import React from 'react';
import { Button, Chip, ContextualNotification } from '@pluginwoman/t-ds';
import { LayerOnLayerRectangleVertical, ArrowRightUp, WarningTriangle, WarningCircle } from '@pluginwoman/t-ds/icons/20/Stroked';
import { InsightSettings, NOTICE_INFO } from '../insights';
import { Payment, formatRub } from '../data';

const NOTICE_ICON = {
  brand: <LayerOnLayerRectangleVertical />,
  success: <ArrowRightUp />,
  warning: <WarningTriangle />,
  error: <WarningCircle />,
};

/** Инсайд-нотификация — одна за раз; крестик скрывает её, пока в настройках не выберут другую */
export const InsightNoticeBanner: React.FC<{ insights: InsightSettings }> = ({ insights }) => {
  const [dismissedNotice, setDismissedNotice] = React.useState<string>();
  const notice = insights.notice !== 'off' && insights.notice !== dismissedNotice ? NOTICE_INFO[insights.notice] : undefined;
  if (!notice) return null;
  return (
    // Клик по нотификации ведёт решать инсайд — переход пока не подключён
    <div role="button" tabIndex={0} className="insight-notice__action" aria-label={`${notice.title} ${notice.text}`}>
      <ContextualNotification
        className={`insight-notice insight-notice--${notice.tone}`}
        hasTitle={false}
        accessory="icon"
        icon={NOTICE_ICON[notice.tone]}
        text={
          <>
            <span className="ts-500-s">{notice.title}</span> {notice.text}
          </>
        }
        onClose={() => setDismissedNotice(insights.notice)}
      />
    </div>
  );
};

/** Рекомендация «Откладывайте на налоги» внутри таймлайна */
export const RecommendationBanner: React.FC<{ insights: InsightSettings }> = ({ insights }) => {
  const [isHidden, setIsHidden] = React.useState(false);
  // Если рекомендацию снова включили в настройках — показываем, даже если её скрывали
  React.useEffect(() => {
    if (insights.recommendation) setIsHidden(false);
  }, [insights.recommendation]);
  if (!insights.recommendation || isHidden) return null;
  return (
    <div className="timeline-banner">
      <span className="ts-500-s timeline-banner__label">Рекомендация</span>
      <div className="timeline-banner__content">
        <p className="ts-400-s">
          Откладывайте на налоги 7% поступлений, чтобы не искать деньги в последний момент. Готовы отложить 37 500 ₽?
        </p>
        <div className="timeline-banner__buttons">
          <Button variant="secondary" size="xs" isHugWidth className="timeline-banner__brand-button">
            Отложить в фонд
          </Button>
          <Button variant="secondary" size="xs" isHugWidth onClick={() => setIsHidden(true)}>
            Скрыть
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TaskChipsProps {
  insights: InsightSettings;
  signCount: number;
  signSum: number;
  /** Валютные поступления, которые ждут документов */
  vedPayments: Payment[];
  onOpenSign: () => void;
  onOpenVed: (payment: Payment) => void;
}

/** Чипы-задачи «N на подпись · сумма» и «N ждут документы · ВЭД» — включаются в настройках */
export const TaskChips: React.FC<TaskChipsProps> = ({ insights, signCount, signSum, vedPayments, onOpenSign, onOpenVed }) => (
  <>
    {insights.signChip && signCount > 0 && (
      <Chip
        variant="tab"
        leftAccessory="icon"
        leftIcon={<span className="insight__dot" />}
        className="compact-timeline__sign-chip"
        onClick={onOpenSign}
      >
        {signCount} на подпись · {formatRub(signSum)}
      </Chip>
    )}
    {insights.vedChip && vedPayments.length > 0 && (
      <Chip
        variant="tab"
        leftAccessory="icon"
        leftIcon={<span className="insight__dot" />}
        className="compact-timeline__sign-chip"
        onClick={() => onOpenVed(vedPayments[0])}
      >
        {vedPayments.length} {vedPayments.length === 1 ? 'ждёт' : 'ждут'} документы · ВЭД
      </Chip>
    )}
  </>
);
