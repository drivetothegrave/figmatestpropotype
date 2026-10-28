import React from 'react';
import { Chip } from '@pluginwoman/t-ds';
import { LayoutRowsTwo, LinesThreeHorizontal } from '@pluginwoman/t-ds/icons/32/Stroked';

interface ViewToggleProps {
  isCompact: boolean;
  onChange: (isCompact: boolean) => void;
}

/** Переключатель вида списка: подробный / компактный — квадратные чипы-табы, выбранный с обводкой (как в макете) */
export const ViewToggle: React.FC<ViewToggleProps> = ({ isCompact, onChange }) => (
  <div className="history-card__view" role="group" aria-label="Вид списка">
    <Chip
      variant="tab"
      leftAccessory="icon"
      leftIcon={<LayoutRowsTwo />}
      isSelected={!isCompact}
      onClick={() => onChange(false)}
      className="icon-chip"
    >
      <span className="visually-hidden">Подробный вид</span>
    </Chip>
    <Chip
      variant="tab"
      leftAccessory="icon"
      leftIcon={<LinesThreeHorizontal />}
      isSelected={isCompact}
      onClick={() => onChange(true)}
      className="icon-chip"
    >
      <span className="visually-hidden">Компактный вид</span>
    </Chip>
  </div>
);
