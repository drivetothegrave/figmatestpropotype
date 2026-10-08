import React from 'react';
import { IconButton } from '@pluginwoman/t-ds';
import { LayoutRowsTwo, LinesThreeHorizontal } from '@pluginwoman/t-ds/icons';

interface ViewToggleProps {
  isCompact: boolean;
  onChange: (isCompact: boolean) => void;
}

/** Переключатель вида списка: подробный / компактный (общий для вкладок «Операций») */
export const ViewToggle: React.FC<ViewToggleProps> = ({ isCompact, onChange }) => (
  <div className="history-card__view" role="group" aria-label="Вид списка">
    <IconButton
      icon={<LayoutRowsTwo />}
      ariaLabel="Подробный вид"
      variant="secondary"
      size="xs"
      className={!isCompact ? 'is-active' : undefined}
      onClick={() => onChange(false)}
    />
    <IconButton
      icon={<LinesThreeHorizontal />}
      ariaLabel="Компактный вид"
      variant="secondary"
      size="xs"
      className={isCompact ? 'is-active' : undefined}
      onClick={() => onChange(true)}
    />
  </div>
);
