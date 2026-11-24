import React from 'react';
import { LetterAAcsStarShine } from '@pluginwoman/t-ds/icons/24/Filled';

interface AskFieldProps {
  onAsk: (question: string) => void;
  /** Подсказка в поле — на странице диалога там следующий вопрос сценария */
  placeholder?: string;
  /** Пустой Enter отправляет подсказку — чтобы пройти сценарий, не набирая текст */
  isPlaceholderSendable?: boolean;
  /** Под полем: что ассистент хочет сказать сам */
  children?: React.ReactNode;
  className?: string;
}

/** Карточка ассистента: поле «Спросите или поручите» в фиолетовой рамке, под ним — его реплика */
export const AskField: React.FC<AskFieldProps> = ({
  onAsk,
  placeholder = 'Спросите или поручите',
  isPlaceholderSendable = false,
  children,
  className = '',
}) => {
  const [value, setValue] = React.useState('');
  return (
    <section className={['assistant', 'future-ask', className].filter(Boolean).join(' ')}>
      <form
        className="assistant__field"
        onSubmit={(e) => {
          e.preventDefault();
          const question = value.trim() || (isPlaceholderSendable ? placeholder : '');
          if (!question) return;
          onAsk(question);
          setValue('');
        }}
      >
        <span className="ds-icon ds-icon--m assistant__icon" aria-hidden="true">
          <LetterAAcsStarShine />
        </span>
        <input
          className="ts-400-m assistant__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Спросите или поручите"
        />
      </form>
      {children}
    </section>
  );
};
