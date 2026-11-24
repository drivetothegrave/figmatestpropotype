import React from 'react';
import { Button, IconButton } from '@pluginwoman/t-ds';
import { DotsThreeHorizontal } from '@pluginwoman/t-ds/icons/20/Stroked';
import { FutureWidgetId } from '../../future';
import type { HomeLine, ProposalDef } from '../../businesses';
import { AskField } from './AskField';
import { FutureWidget } from './FutureWidgets';

interface FutureHomePageProps {
  /** Имя в приветствии */
  name: string;
  /** Предложение ассистента — виджет пунктиром и кнопки «Добавить» / «Не сейчас» */
  proposal?: ProposalDef;
  onAcceptProposal: () => void;
  onDeclineProposal: () => void;
  /** Реплика ассистента, когда предлагать нечего */
  line: HomeLine;
  onLineAction: (flag: string) => void;
  money: string;
  pinned: FutureWidgetId[];
  fresh?: FutureWidgetId;
  onUnpin: (id: FutureWidgetId) => void;
  /** «⋯ → Открыть разговор» — у виджетов, собранных в разговоре */
  widgetThread: (id: FutureWidgetId) => (() => void) | undefined;
  /** Подсказка в поле — следующий вопрос сценария; пустой Enter его задаёт */
  askPlaceholder?: string;
  onAsk: (question: string) => void;
  onPay: () => void;
}

/**
 * Главная концепта «из будущего»: приветствие, ассистент и только то, что банк принёс сам
 * или клиент закрепил. Виджеты по 2 в ряд (широкий — один), все одной высоты.
 */
export const FutureHomePage: React.FC<FutureHomePageProps> = ({
  name,
  proposal,
  onAcceptProposal,
  onDeclineProposal,
  line,
  onLineAction,
  money,
  pinned,
  fresh,
  onUnpin,
  widgetThread,
  askPlaceholder,
  onAsk,
  onPay,
}) => (
  <div className="future-home">
    <div className="future-home__header">
      <h1 className="ts-600-4xl">Доброе утро, {name}!</h1>
      <AskField onAsk={onAsk} placeholder={askPlaceholder} isPlaceholderSendable={!!askPlaceholder}>
        {proposal ? (
          <>
            <p className="ts-500-s">{proposal.text}</p>
            <div className="future-buttons">
              <Button variant="secondary" size="xs" isHugWidth className="future-button--inverse" onClick={onAcceptProposal}>
                {proposal.accept}
              </Button>
              <Button variant="secondary" size="xs" isHugWidth onClick={onDeclineProposal}>
                Не сейчас
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="ts-500-s">{line.text}</p>
            {line.actions && (
              <div className="future-buttons">
                {line.actions.map((action) => (
                  <Button
                    key={action.flag}
                    variant="secondary"
                    size="xs"
                    isHugWidth
                    className={action.isPrimary ? 'future-button--inverse' : ''}
                    onClick={() => onLineAction(action.flag)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </AskField>
    </div>

    <div className="future-home__money">
      <div className="home-widget-total">
        <span className="ts-400-s home-widget-secondary">Всего денег</span>
        <span className="ts-500-l">{money}</span>
      </div>
      <div className="future-buttons">
        <Button variant="primary" size="s" isHugWidth onClick={onPay}>
          Заплатить
        </Button>
        <Button variant="secondary" size="s" isHugWidth>
          Скачать выписку
        </Button>
        <Button variant="secondary" size="s" isHugWidth>
          Выставить счёт
        </Button>
        <IconButton icon={<DotsThreeHorizontal />} ariaLabel="Ещё" variant="secondary" size="s" />
      </div>
    </div>

    {(proposal || pinned.length > 0) && (
      <div className="future-home__widgets">
        {pinned.map((id) => (
          <FutureWidget
            key={id}
            id={id}
            state={id === fresh ? 'fresh' : 'pinned'}
            onUnpin={() => onUnpin(id)}
            onOpenThread={widgetThread(id)}
          />
        ))}
        {proposal && <FutureWidget id={proposal.widget} state="proposed" />}
      </div>
    )}
  </div>
);
