import React from 'react';
import { IconButton } from '@pluginwoman/t-ds';
import { BubbleRounded, LetterAAcsStarShine } from '@pluginwoman/t-ds/icons/24/Filled';

/** Плавающие кнопки справа внизу: ассистент и чат с банком */
export const FloatingActions: React.FC<{ onOpenAssistant: () => void; hasAssistant?: boolean }> = ({
  onOpenAssistant,
  hasAssistant = true,
}) => (
  <div className="floating-actions">
    {/* В концепте «из будущего» ассистент живёт на главной и в ветках — отдельная кнопка не нужна */}
    {hasAssistant && <IconButton
      icon={<LetterAAcsStarShine />}
      ariaLabel="Ассистент"
      variant="white"
      size="l"
      className="floating-actions__button"
      onClick={onOpenAssistant}
    />}
    <IconButton icon={<BubbleRounded />} ariaLabel="Чат с банком" variant="white" size="l" className="floating-actions__button" />
  </div>
);
