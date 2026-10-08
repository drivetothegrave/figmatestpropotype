import React from 'react';
import { Button, Cell, CellRightAccessory, Chip, IconButton } from '@pluginwoman/t-ds';
import { ArrowRotationLeft, Cross, Gear, Plus } from '@pluginwoman/t-ds/icons';
import { paymentsWord } from '../data';
import { InsightSettings, RISK_LABEL, RiskMode } from '../insights';

interface DemoPanelProps {
  signCount: number;
  signedCount: number;
  onAddSignPayment: () => void;
  onRestoreSigned: () => void;
  onReset: () => void;
  insights: InsightSettings;
  onInsightsChange: (next: InsightSettings) => void;
}

const INSIGHT_TOGGLES: { key: Exclude<keyof InsightSettings, 'risk'>; title: string }[] = [
  { key: 'sign', title: 'На подпись' },
  { key: 'income', title: 'Поступления выросли' },
  { key: 'recommendation', title: 'Рекомендация про налоги' },
];

const RISK_MODES: RiskMode[] = ['off', 'low', 'medium', 'high'];

/** Служебная панель прототипа — не часть интерфейса банка, нужна для демо */
export const DemoPanel: React.FC<DemoPanelProps> = ({
  signCount,
  signedCount,
  onAddSignPayment,
  onRestoreSigned,
  onReset,
  insights,
  onInsightsChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="demo-panel">
      {isOpen && (
        <div className="demo-panel__card" role="dialog" aria-label="Настройки прототипа">
          <div className="demo-panel__header">
            <div>
              <p className="ts-600-m">Настройки прототипа</p>
              <p className="ts-400-s demo-panel__secondary">На подпись: {paymentsWord(signCount)}</p>
            </div>
            <IconButton
              icon={<Cross />}
              ariaLabel="Закрыть настройки"
              variant="transparent"
              size="xs"
              onClick={() => setIsOpen(false)}
            />
          </div>

          <p className="ts-500-s demo-panel__section">Платежи на подпись</p>
          <Button variant="primary" size="s" leftAccessory={<Plus />} onClick={onAddSignPayment}>
            Добавить платёж на подпись
          </Button>
          <Button
            variant="secondary"
            size="s"
            leftAccessory={<ArrowRotationLeft />}
            isDisabled={signedCount === 0}
            onClick={onRestoreSigned}
          >
            {signedCount > 0 ? `Вернуть подписанные (${signedCount})` : 'Подписанных нет'}
          </Button>

          <p className="ts-500-s demo-panel__section">Инсайды на главной</p>
          {INSIGHT_TOGGLES.map((toggle) => (
            <Cell
              key={toggle.key}
              title={toggle.title}
              titleClassName="ts-400-s"
              verticalPadding="none"
              className="demo-panel__toggle-row"
              rightAccessory={
                <CellRightAccessory
                  variant="switch"
                  isChecked={insights[toggle.key]}
                  onCheckedChange={(value) => onInsightsChange({ ...insights, [toggle.key]: value })}
                />
              }
            />
          ))}

          <p className="ts-400-s demo-panel__label">Риск по операциям</p>
          <div className="demo-panel__chips" role="radiogroup" aria-label="Режим риска">
            {RISK_MODES.map((mode) => (
              <Chip
                key={mode}
                variant="chip"
                isSelected={insights.risk === mode}
                onClick={() => onInsightsChange({ ...insights, risk: mode })}
              >
                {RISK_LABEL[mode]}
              </Chip>
            ))}
          </div>

          <Button variant="transparent" size="s" onClick={onReset}>
            Сбросить прототип
          </Button>
        </div>
      )}

      <IconButton
        icon={<Gear />}
        ariaLabel={isOpen ? 'Скрыть настройки прототипа' : 'Настройки прототипа'}
        variant="white"
        size="l"
        className="demo-panel__toggle"
        onClick={() => setIsOpen((v) => !v)}
      />
    </div>
  );
};
