import React from 'react';
import { Button, IconButton } from '@pluginwoman/t-ds';
import { ArrowRotationLeft, Cross, Gear, Plus } from '@pluginwoman/t-ds/icons';
import { paymentsWord } from '../data';

interface DemoPanelProps {
  signCount: number;
  signedCount: number;
  onAddSignPayment: () => void;
  onRestoreSigned: () => void;
  onReset: () => void;
}

/** Служебная панель прототипа — не часть интерфейса банка, нужна для демо */
export const DemoPanel: React.FC<DemoPanelProps> = ({
  signCount,
  signedCount,
  onAddSignPayment,
  onRestoreSigned,
  onReset,
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
