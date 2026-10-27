import React from 'react';
import { Button, Cell, CellRightAccessory, IconButton } from '@pluginwoman/t-ds';
import { Cross, Gear } from '@pluginwoman/t-ds/icons';
import { InsightSettings } from '../insights';

interface DemoPanelProps {
  settings: InsightSettings;
  onSettingsChange: (next: InsightSettings) => void;
  onReset: () => void;
}

type ToggleKey = 'financePromo' | 'fundRecommendation';

/** Настройки целевого прототипа, по разделам главной */
const SECTIONS: { title: string; toggles: { key: ToggleKey; title: string }[] }[] = [
  {
    title: 'Счета',
    toggles: [
      { key: 'financePromo', title: 'Промо «Финансирование»' },
      { key: 'fundRecommendation', title: 'Рекомендация открыть фонд' },
    ],
  },
];

/** Служебная панель прототипа — не часть интерфейса банка, нужна для демо */
export const DemoPanel: React.FC<DemoPanelProps> = ({ settings, onSettingsChange, onReset }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="demo-panel">
      {isOpen && (
        <div className="demo-panel__card" role="dialog" aria-label="Настройки прототипа">
          <div className="demo-panel__header">
            <p className="ts-600-m">Настройки прототипа</p>
            <IconButton
              icon={<Cross />}
              ariaLabel="Закрыть настройки"
              variant="transparent"
              size="xs"
              onClick={() => setIsOpen(false)}
            />
          </div>

          {SECTIONS.map((section) => (
            <React.Fragment key={section.title}>
              <p className="ts-500-s demo-panel__section">{section.title}</p>
              {section.toggles.map((toggle) => (
                <Cell
                  key={toggle.key}
                  title={toggle.title}
                  titleClassName="ts-400-s"
                  verticalPadding="none"
                  className="demo-panel__toggle-row"
                  rightAccessory={
                    <CellRightAccessory
                      variant="switch"
                      isChecked={settings[toggle.key]}
                      onCheckedChange={(value) => onSettingsChange({ ...settings, [toggle.key]: value })}
                    />
                  }
                />
              ))}
            </React.Fragment>
          ))}

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
