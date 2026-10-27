import React from 'react';
import { Button } from '@pluginwoman/t-ds';
import { ChevronDown, DocumentListAcsArrowDownOutgoing, FileListShortReverse, Filters, Wallet } from '@pluginwoman/t-ds/icons/32/Stroked';
import { LetterAAcsStarShine } from '@pluginwoman/t-ds/icons/24/Filled';
import { Payment, formatRub, paymentsWord } from '../../data';
import { FinanceWidget } from './FinanceWidget';
import { HistoryWidget } from './HistoryWidget';

interface HomePageProps {
  payments: Payment[];
  comments: Record<string, string>;
  signCount: number;
  signSum: number;
  selectedId?: string;
  onOpenPayment: (payment: Payment) => void;
  onComment: (payment: Payment) => void;
  onOpenOperations: (tab: 'all' | 'sign', query?: string) => void;
}

/** Главная в редизайне: приветствие, ассистент с задачами, быстрые действия и виджеты */
export const HomePage: React.FC<HomePageProps> = ({
  payments,
  comments,
  signCount,
  signSum,
  selectedId,
  onOpenPayment,
  onComment,
  onOpenOperations,
}) => {
  const [query, setQuery] = React.useState('');

  return (
    <div className="home">
      <h1 className="ts-600-4xl">Доброе утро, Тимур!</h1>

      <section className="assistant">
        {/* Пока ассистент ищет по операциям: Enter — «Операции» с этим запросом */}
        <form
          className="assistant__field"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) onOpenOperations('all', query.trim());
          }}
        >
          <span className="ds-icon ds-icon--m assistant__icon" aria-hidden="true">
            <LetterAAcsStarShine />
          </span>
          <input
            className="ts-400-m assistant__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти или спросить ассистента"
            aria-label="Найти или спросить ассистента"
          />
        </form>
        <div className="assistant__tasks">
          <p className="ts-500-s">
            Сегодня 2 важные задачи:{' '}
            {signCount > 0 ? (
              <>
                <button type="button" className="home-link" onClick={() => onOpenOperations('sign')}>
                  подписать {paymentsWord(signCount)}
                </button>{' '}
                на {formatRub(signSum)} и{' '}
              </>
            ) : null}
            <button type="button" className="home-link">
              заплатить УСН
            </button>{' '}
            за VI квартал
          </p>
          <button type="button" className="ts-500-s home-link hoverOpacity">
            Все задачи · 5
          </button>
        </div>
      </section>

      <div className="home__actions">
        <div className="home__actions-main">
          <Button variant="primary" size="s" isHugWidth leftAccessory={<Wallet />}>
            Заплатить
          </Button>
          <Button variant="secondary" size="s" isHugWidth leftAccessory={<DocumentListAcsArrowDownOutgoing />}>
            Скачать выписку
          </Button>
          <Button variant="secondary" size="s" isHugWidth leftAccessory={<FileListShortReverse />}>
            Выставить счёт
          </Button>
          <Button variant="secondary" size="s" isHugWidth rightAccessory={<ChevronDown />}>
            Ещё
          </Button>
        </div>
        <Button variant="secondary" size="s" isHugWidth leftAccessory={<Filters />}>
          Настроить
        </Button>
      </div>

      <FinanceWidget />

      <HistoryWidget
        payments={payments}
        comments={comments}
        selectedId={selectedId}
        onOpenPayment={onOpenPayment}
        onComment={onComment}
        onOpenOperations={onOpenOperations}
      />
    </div>
  );
};
