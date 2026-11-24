import React from 'react';
import { Button, Spinner } from '@pluginwoman/t-ds';
import { ArrowRight } from '@pluginwoman/t-ds/icons/20/Stroked';
import { CheckmarkCircle } from '@pluginwoman/t-ds/icons/20/Filled';
import { CardDecision, DialogState } from '../../future';
import type { DialogDef } from '../../businesses';
import { AskField } from './AskField';
import { FutureWidget, widgetTitle } from './FutureWidgets';

interface DialogPageProps {
  def: DialogDef;
  dialog: DialogState;
  /** Ассистент ещё готовит ответ на последний вопрос */
  isThinking: boolean;
  onAsk: (question: string) => void;
  onCardDecision: (decision: Exclude<CardDecision, 'pending'>) => void;
  onOpenHome: () => void;
}

const UserMessage: React.FC<{ text: string; time: string }> = ({ text, time }) => (
  <div className="chat-bubble chat-bubble--outbox future-dialog__question">
    <p className="chat-bubble__content ts-400-m">{text}</p>
    <span className="chat-bubble__time ts-400-xs">{time}</span>
  </div>
);

/** Ветка разговора с ассистентом: вопросы клиента баблами, ответы — текстом с карточками и графиками */
export const DialogPage: React.FC<DialogPageProps> = ({ def, dialog, isThinking, onAsk, onCardDecision, onOpenHome }) => {
  const endRef = React.useRef<HTMLDivElement | null>(null);
  const answered = dialog.questions.length - (isThinking ? 1 : 0);
  const nextQuestion = def.questions[dialog.questions.length];
  const offer = def.offer;
  const isCardOffered = !!offer && answered === def.questions.length;

  // Новый вопрос, ответ или решение по карточке — прокручиваем к ним
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [dialog.questions.length, isThinking, dialog.card]);

  return (
    <div className="future-dialog">
      <header className="future-dialog__header">
        <h1 className="ts-600-4xl">{def.title}</h1>
        <p className="ts-400-s home-widget-secondary">
          Сегодня{dialog.times[0] ? `, ${dialog.times[0]}` : ''} · {def.source}
        </p>
      </header>

      {def.intro && <div className="future-answer ts-500-s">{def.intro}</div>}

      {dialog.questions.map((question, i) => (
        <React.Fragment key={i}>
          <UserMessage text={question} time={dialog.times[i]} />
          {i < answered && (
            <div className="future-answer ts-500-s">{def.answers[i]?.({ ask: onAsk, isLast: i === answered - 1 && !isCardOffered, next: def.questions[i + 1], question })}</div>
          )}
        </React.Fragment>
      ))}

      {isThinking && (
        <p className="future-thinking ts-400-s">
          <Spinner className="future-thinking__spinner" />
          Разбираюсь…
        </p>
      )}

      {offer && isCardOffered && (
        <>
          <div className="future-offer">
            <p className="ts-500-s">{offer.text}</p>
            <div className="future-offer__widget">
              <FutureWidget id={offer.widget} state="preview" />
            </div>
            {dialog.card === 'pending' && (
              <div className="future-buttons">
                <Button variant="secondary" size="s" isHugWidth className="future-button--inverse" onClick={() => onCardDecision('added')}>
                  Добавить на главную
                </Button>
                {/* Порог есть только у карточек с предупреждением */}
                {offer.widget === 'products-salary' && (
                  <Button variant="secondary" size="s" isHugWidth>
                    Изменить порог
                  </Button>
                )}
                <Button variant="transparent" size="s" isHugWidth className="future-button--muted" onClick={() => onCardDecision('dismissed')}>
                  Не нужно
                </Button>
              </div>
            )}
          </div>

          {dialog.card !== 'pending' && (
            <>
              <p className="future-pressed ts-400-xs">
                <span className="future-pressed__button ts-500-s">
                  {dialog.card === 'added' ? 'Добавить на главную' : 'Не нужно'}
                </span>
                нажато в {dialog.cardTime}
              </p>
              {dialog.card === 'added' ? (
                <div className="future-answer ts-500-s">
                  <div className="future-done">
                    <span className="ds-icon future-done__icon" aria-hidden="true">
                      <CheckmarkCircle />
                    </span>
                    <span className="ts-400-s">Карточка «{widgetTitle(offer.widget)}» на главной</span>
                    <button type="button" className="future-done__link ts-500-s hoverOpacity" onClick={onOpenHome}>
                      Открыть главную
                      <span className="ds-icon" aria-hidden="true">
                        <ArrowRight />
                      </span>
                    </button>
                  </div>
                  <p>{offer.addedText}</p>
                </div>
              ) : (
                <div className="future-answer ts-500-s">
                  <p>Хорошо, не добавляю. Если передумаете — просто попросите.</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      <div ref={endRef} className="future-dialog__end" />

      <div className="future-dialog__composer">
        <AskField
          onAsk={onAsk}
          placeholder={!isThinking && nextQuestion ? nextQuestion : 'Спросите или поручите'}
          isPlaceholderSendable={!isThinking && !!nextQuestion}
        />
      </div>
    </div>
  );
};
