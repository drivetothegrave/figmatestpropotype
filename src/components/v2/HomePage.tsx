import React from 'react';
import { Button } from '@pluginwoman/t-ds';
import { ChevronDown, DocumentListAcsArrowDownOutgoing, FileListShortReverse, Filters, Wallet } from '@pluginwoman/t-ds/icons/32/Stroked';
import { LetterAAcsStarShine } from '@pluginwoman/t-ds/icons/24/Filled';
import { Payment, formatRub, paymentsWord } from '../../data';
import { FinanceWidget } from './FinanceWidget';
import { InsightSettings } from '../../insights';
import { HistoryWidget } from './HistoryWidget';
import { WidgetsEditor, WidgetsGrid } from './WidgetsGrid';
import { DEFAULT_HOME_WIDGETS, HomeWidgetId } from './homeWidgets';

interface HomePageProps {
  /** Настройки прототипа: промо и рекомендации в виджетах */
  settings: InsightSettings;
  payments: Payment[];
  comments: Record<string, string>;
  signCount: number;
  signSum: number;
  selectedId?: string;
  onOpenPayment: (payment: Payment) => void;
  onComment: (payment: Payment) => void;
  onOpenOperations: (tab: 'all' | 'sign', query?: string) => void;
  /** Виджеты между «Финансами» и «Историей» — в порядке на главной */
  widgets: HomeWidgetId[];
  onWidgetsChange: (next: HomeWidgetId[]) => void;
  /** «Заплатить» — страница «Платёж по реквизитам» */
  onPay: () => void;
}

/** Главная в редизайне: приветствие, ассистент с задачами, быстрые действия и виджеты */
export const HomePage: React.FC<HomePageProps> = ({
  settings,
  payments,
  comments,
  signCount,
  signSum,
  selectedId,
  onOpenPayment,
  onComment,
  onOpenOperations,
  widgets,
  onWidgetsChange,
  onPay,
}) => {
  const [query, setQuery] = React.useState('');
  // Режим «Настройка главной»: правим черновик, на главную он попадает только по «Сохранить»
  const [draft, setDraft] = React.useState<HomeWidgetId[]>();
  const startEditing = () => {
    setDraft(widgets);
    window.scrollTo({ top: 0 });
  };

  if (draft) {
    return (
      <WidgetsEditor
        draft={draft}
        onDraftChange={setDraft}
        onReset={() => setDraft(DEFAULT_HOME_WIDGETS)}
        onCancel={() => setDraft(undefined)}
        onSave={() => {
          onWidgetsChange(draft);
          setDraft(undefined);
        }}
      />
    );
  }

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
          <Button variant="primary" size="s" isHugWidth leftAccessory={<Wallet />} onClick={onPay}>
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
        <Button variant="secondary" size="s" isHugWidth leftAccessory={<Filters />} onClick={startEditing}>
          Настроить
        </Button>
      </div>

      {/* Финансы и добавленные виджеты — одной сеткой с шагом 16px; История — отдельно, через 32px */}
      <div className="home__widgets">
        <FinanceWidget
          hasFinancePromo={settings.financePromo}
          hasFundRecommendation={settings.fundRecommendation}
          isAccountsList={settings.accountsList}
        />

        <WidgetsGrid ids={widgets} />
      </div>

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
