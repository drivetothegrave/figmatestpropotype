import React from 'react';
import { Button, IconButton } from '@pluginwoman/t-ds';
import { DotsThreeHorizontal } from '@pluginwoman/t-ds/icons/20/Stroked';
import { FutureWidgetId } from '../../future';
import { AskField } from './AskField';
import { FutureWidget } from './FutureWidgets';

interface FutureHomePageProps {
  /** Ассистент пришёл с предложением виджета «Выручка» (и клиент ещё не ответил) */
  hasProposal: boolean;
  onAcceptProposal: () => void;
  onDeclineProposal: () => void;
  pinned: FutureWidgetId[];
  onUnpin: (id: FutureWidgetId) => void;
  /** Виджет собран в разговоре — «⋯ → Открыть разговор» */
  onOpenWidgetThread: (id: FutureWidgetId) => void;
  onAsk: (question: string) => void;
  onPay: () => void;
}

/**
 * Главная концепта «из будущего»: приветствие, ассистент и только то, что банк принёс сам
 * или клиент закрепил. Если всё хорошо — «Всё спокойно» и ничего лишнего.
 */
export const FutureHomePage: React.FC<FutureHomePageProps> = ({
  hasProposal,
  onAcceptProposal,
  onDeclineProposal,
  pinned,
  onUnpin,
  onOpenWidgetThread,
  onAsk,
  onPay,
}) => (
  <div className="future-home">
    <div className="future-home__header">
      <h1 className="ts-600-4xl">Доброе утро, Тимур!</h1>
      <AskField onAsk={onAsk}>
        {hasProposal ? (
          <>
            <p className="ts-500-s">
              Вы подключили эквайринг и кассу — могу показывать выручку за сегодня и статус терминалов
            </p>
            <div className="future-buttons">
              <Button variant="secondary" size="xs" isHugWidth className="future-button--inverse" onClick={onAcceptProposal}>
                Хорошо, оставляй
              </Button>
              <Button variant="secondary" size="xs" isHugWidth onClick={onDeclineProposal}>
                Не сейчас
              </Button>
            </div>
          </>
        ) : (
          <p className="ts-500-s">Всё спокойно. Если что-то изменится — скажу.</p>
        )}
      </AskField>
    </div>

    <div className="future-home__money">
      <div className="home-widget-total">
        <span className="ts-400-s home-widget-secondary">Всего денег</span>
        <span className="ts-500-l">3 422 785,37 ₽</span>
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

    {(hasProposal || pinned.length > 0) && (
      <div className="future-home__widgets">
        {pinned.map((id) => (
          <FutureWidget
            key={id}
            id={id}
            state="pinned"
            onUnpin={() => onUnpin(id)}
            onOpenThread={id === 'products-salary' ? () => onOpenWidgetThread(id) : undefined}
          />
        ))}
        {hasProposal && <FutureWidget id="revenue" state="proposed" />}
      </div>
    )}
  </div>
);
