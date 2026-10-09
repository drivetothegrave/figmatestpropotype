import React from 'react';
import { ArrowDownUnderline, ArrowReturnRight, BubbleListShort, Cross, Printer, Share } from '@pluginwoman/t-ds/icons';
import { Payment, formatRub, inRub } from '../data';

interface SelectionBarProps {
  selected: Payment[];
  onComment: () => void;
  onClear: () => void;
}

/** Чёрная плашка массовых действий над выделенными операциями */
export const SelectionBar: React.FC<SelectionBarProps> = ({ selected, onComment, onClear }) => {
  const rub = inRub(selected);
  const income = rub.filter((p) => p.sum > 0).reduce((acc, p) => acc + p.sum, 0);
  const expense = rub.filter((p) => p.sum < 0).reduce((acc, p) => acc + Math.abs(p.sum), 0);

  const actions = [
    { label: 'Комментарий', icon: <BubbleListShort />, onClick: onComment },
    { label: 'Распечатать', icon: <Printer /> },
    { label: 'Скачать', icon: <ArrowDownUnderline /> },
    { label: 'Повторить', icon: <ArrowReturnRight /> },
    { label: 'Поделиться', icon: <Share /> },
  ];

  return (
    <div className="selection-bar" role="toolbar" aria-label={`Выбрано операций: ${selected.length}`}>
      <button type="button" className="selection-bar__close hoverOpacity" aria-label="Снять выделение" onClick={onClear}>
        <span className="ds-icon ds-icon--m" aria-hidden="true">
          <Cross />
        </span>
      </button>

      <span className="ts-500-m selection-bar__count">Выбрано {selected.length}</span>

      <span className="selection-bar__sums">
        {income > 0 && <span className="ts-500-s selection-bar__income">+ {formatRub(income)}</span>}
        {expense > 0 && <span className="ts-500-s selection-bar__expense">– {formatRub(expense)}</span>}
      </span>

      <span className="selection-bar__actions">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="selection-bar__action hoverOpacity"
            onClick={action.onClick}
          >
            <span className="ds-icon ds-icon--m" aria-hidden="true">
              {action.icon}
            </span>
            <span className="ts-500-xs">{action.label}</span>
          </button>
        ))}
      </span>
    </div>
  );
};
