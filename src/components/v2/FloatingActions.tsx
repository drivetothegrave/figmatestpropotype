import React from 'react';
import { IconButton } from '@pluginwoman/t-ds';
import { BubbleRounded, LetterAAcsStarShine } from '@pluginwoman/t-ds/icons/24/Filled';

/** Плавающие кнопки справа внизу: ассистент и чат с банком */
export const FloatingActions: React.FC = () => (
  <div className="floating-actions">
    <IconButton icon={<LetterAAcsStarShine />} ariaLabel="Ассистент" variant="white" size="l" className="floating-actions__button" />
    <IconButton icon={<BubbleRounded />} ariaLabel="Чат с банком" variant="white" size="l" className="floating-actions__button" />
  </div>
);
