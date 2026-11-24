import React from 'react';
import { Button, Chip, Spinner } from '@pluginwoman/t-ds';
import { ArrowRight, InformationCircle } from '@pluginwoman/t-ds/icons/20/Stroked';
import { CheckmarkCircle } from '@pluginwoman/t-ds/icons/20/Filled';
import { CardDecision, DIALOG_QUESTIONS, DIALOG_TITLE, FutureState } from '../../future';
import { AskField } from './AskField';
import { FutureWidget } from './FutureWidgets';

interface DialogPageProps {
  dialog: FutureState['dialog'];
  /** Ассистент ещё готовит ответ на последний вопрос */
  isThinking: boolean;
  onAsk: (question: string) => void;
  onCardDecision: (decision: Exclude<CardDecision, 'pending'>) => void;
  onOpenHome: () => void;
}

/** Сноска мелким шрифтом: откуда цифры */
const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="future-note ts-400-xs">
    <span className="ds-icon future-note__icon" aria-hidden="true">
      <InformationCircle />
    </span>
    {children}
  </p>
);

/** Подсказки следующего шага. Чип со сценарным вопросом задаёт его, остальные — для вида */
const FollowUps: React.FC<{ items: string[]; question?: string; onAsk?: (q: string) => void }> = ({
  items,
  question,
  onAsk,
}) => (
  <div className="future-followups">
    {items.map((item, i) => (
      <Chip key={item} variant="chip" onClick={i === 0 && question && onAsk ? () => onAsk(question) : undefined}>
        {item}
      </Chip>
    ))}
  </div>
);

const Card: React.FC<{ title?: string; aside?: string; children: React.ReactNode }> = ({ title, aside, children }) => (
  <div className="future-card">
    {title && (
      <div className="future-card__title">
        <span className="ts-500-l">{title}</span>
        {aside && <span className="ts-400-s home-widget-secondary">{aside}</span>}
      </div>
    )}
    {children}
  </div>
);

/** Куда уходит выручка — сегменты продукты / зарплата / остальное */
const REVENUE_SPLIT = [
  { label: 'Продукты', amount: '1 057 100 ₽', share: 31, color: 'var(--category-indigo)' },
  { label: 'Зарплата', amount: '988 900 ₽', share: 29, color: 'var(--category-emerald)' },
  { label: 'Остальное', amount: '1 364 000 ₽', share: 40, color: 'var(--bg-neutral-4)' },
];

const SegmentedBar: React.FC = () => (
  <>
    <div className="future-segments" aria-hidden="true">
      {REVENUE_SPLIT.map((s) => (
        <span key={s.label} style={{ flexGrow: s.share, background: s.color }} />
      ))}
    </div>
    <div className="future-legend ts-400-xs">
      {REVENUE_SPLIT.map((s) => (
        <span key={s.label}>
          <i style={{ background: s.color }} />
          {s.label} — {s.amount}
        </span>
      ))}
    </div>
  </>
);

/** Таблица ответа: первая колонка — подписи, остальные — по правому краю; isHigh — значения выше нормы */
const Table: React.FC<{ head: string[]; rows: { cells: string[]; high?: number[]; isTotal?: boolean }[] }> = ({
  head,
  rows,
}) => (
  <table className="future-table">
    <thead>
      <tr className="ts-400-xs">
        {head.map((h, i) => (
          <th key={i}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody className="ts-400-s">
      {rows.map((row) => (
        <tr key={row.cells[0]} className={row.isTotal ? 'ts-500-s' : ''}>
          {row.cells.map((cell, i) => (
            <td key={i} className={row.high?.includes(i) ? 'future-table__high' : ''}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

/** Зарплата на Арбате по неделям: факт сплошной, прогноз пунктиром, «сейчас» — вертикалью */
const SALARY_WEEKS = [
  { label: '1 нед · 48%', value: 48 },
  { label: '2 нед', value: 42 },
  { label: '3 нед', value: 37 },
  { label: 'сейчас · 33%', value: 33 },
  { label: 'прогноз', value: 30.5 },
  { label: 'сер. дек · 28%', value: 28 },
];
const NOW_INDEX = 3;

const SalaryChart: React.FC = () => {
  const x = (i: number) => (i / (SALARY_WEEKS.length - 1)) * 600;
  const y = (v: number) => 8 + ((48 - v) / 20) * 112;
  const points = (from: number, to: number) =>
    SALARY_WEEKS.slice(from, to + 1)
      .map((w, i) => `${x(from + i)},${y(w.value)}`)
      .join(' ');
  return (
    <div className="future-line-chart">
      <svg viewBox="0 0 600 128" preserveAspectRatio="none" aria-hidden="true">
        <line x1={x(NOW_INDEX)} y1="0" x2={x(NOW_INDEX)} y2="128" className="future-line-chart__now" vectorEffect="non-scaling-stroke" />
        <polyline points={points(0, NOW_INDEX)} className="future-line-chart__line" vectorEffect="non-scaling-stroke" />
        <polyline
          points={points(NOW_INDEX, SALARY_WEEKS.length - 1)}
          className="future-line-chart__line future-line-chart__line--forecast"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="future-line-chart__labels ts-400-xs">
        {SALARY_WEEKS.map((w) => (
          <span key={w.label}>{w.label}</span>
        ))}
      </div>
    </div>
  );
};

/** Ответы ассистента по сценарию — по индексу вопроса */
const ANSWERS: ((ask: (q: string) => void, isLast: boolean) => React.ReactNode)[] = [
  (ask, isLast) => (
    <>
      <p>
        За ноябрь, с 1 по 23 число, кофейни заработали <b>3 410 000 ₽</b>. На продукты ушло 31%, на зарплату — 29%.
        Остаётся 40% на аренду, налоги и прибыль.
      </p>
      <Card title="Куда уходит выручка" aside="3 410 000 ₽">
        <SegmentedBar />
      </Card>
      <p>По точкам картина разная:</p>
      <Card>
        <Table
          head={['Точка', 'Выручка', 'Продукты', 'Зарплата']}
          rows={[
            { cells: ['Пятницкая', '2 300 000 ₽', '644 000 ₽ · 28%', '621 000 ₽ · 27%'] },
            { cells: ['Арбат', '1 110 000 ₽', '413 100 ₽ · 37%', '367 900 ₽ · 33%'], high: [2, 3] },
            { cells: ['Итого', '3 410 000 ₽', '1 057 100 ₽ · 31%', '988 900 ₽ · 29%'], isTotal: true },
          ]}
        />
      </Card>
      <Note>
        Считал по платежам поставщикам и зарплатным ведомостям. 4 платежа без назначения отнёс к продуктам —{' '}
        <button type="button" className="home-link">проверить</button>
      </Note>
      <p>На Арбате обе доли заметно выше. Разобрать, почему?</p>
      {isLast && (
        <FollowUps
          items={['Почему на Арбате дороже', 'Сравнить с октябрём', 'Показать поставщиков']}
          question={DIALOG_QUESTIONS[1]}
          onAsk={ask}
        />
      )}
    </>
  ),
  (_ask, isLast) => (
    <>
      <p>Две причины, обе поправимые.</p>
      <p>
        <b>1. Молоко дороже на четверть.</b> Арбат берёт у «Молочного двора» по 112 ₽ за литр, Пятницкая —
        у «Фермерского» по 89 ₽. При 1 200 литрах в месяц это ≈ 134 000 ₽ против 107 000 ₽.
      </p>
      <p>
        <b>2. Много выпечки уходит в списание.</b> Заказ выпечки на обеих точках одинаковый, а гостей на Арбате пока
        вдвое меньше.
      </p>
      <Card>
        <Table
          head={['', 'Пятницкая', 'Арбат']}
          rows={[
            { cells: ['Молоко, ₽ за литр', '89 ₽', '112 ₽'], high: [2] },
            { cells: ['Списано выпечки за ноябрь', '22 000 ₽', '64 000 ₽'], high: [2] },
            { cells: ['Чеков в день', '≈ 640', '≈ 310'] },
          ]}
        />
      </Card>
      <p>
        Если перевести Арбат на «Фермерского» и сократить заказ выпечки на треть, продукты опустятся примерно до 32%.
        Это ≈ 55 000 ₽ в месяц.
      </p>
      {isLast && <FollowUps items={['Написать «Фермерскому» про вторую точку', 'Как сократить списания']} />}
    </>
  ),
  () => (
    <>
      <p>Обычно у кофеен продукты занимают 25–35% выручки, зарплата — 25–30%. Пятницкая в норме по обоим.</p>
      <p>
        На Арбате зарплата 33%, но это нормально для точки, которая работает четвёртую неделю: смена полная, а гостей
        ещё мало. Доля падает каждую неделю — если рост выручки сохранится, к середине декабря Арбат выйдет на 28–29%.
      </p>
      <Card title="Зарплата на Арбате, доля от выручки по неделям">
        <SalaryChart />
      </Card>
      <Note>Норма — по данным кофеен на обслуживании в Точке, без названий и сумм конкретных компаний</Note>
    </>
  ),
  () => <p>Хороший план. Через пару недель станет видно, сработало ли.</p>,
];

const UserMessage: React.FC<{ text: string; time: string }> = ({ text, time }) => (
  <div className="chat-bubble chat-bubble--outbox future-dialog__question">
    <p className="chat-bubble__content ts-400-m">{text}</p>
    <span className="chat-bubble__time ts-400-xs">{time}</span>
  </div>
);

/** Ветка разговора с ассистентом: вопросы клиента баблами, ответы — текстом с карточками и графиками */
export const DialogPage: React.FC<DialogPageProps> = ({ dialog, isThinking, onAsk, onCardDecision, onOpenHome }) => {
  const endRef = React.useRef<HTMLDivElement | null>(null);
  const answered = dialog.questions.length - (isThinking ? 1 : 0);
  const nextQuestion = DIALOG_QUESTIONS[dialog.questions.length];
  const isCardOffered = answered === DIALOG_QUESTIONS.length;

  // Новый вопрос, ответ или решение по карточке — прокручиваем к ним
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [dialog.questions.length, isThinking, dialog.card]);

  return (
    <div className="future-dialog">
      <header className="future-dialog__header">
        <h1 className="ts-600-4xl">{DIALOG_TITLE}</h1>
        <p className="ts-400-s home-widget-secondary">
          Сегодня, {dialog.times[0]} · данные по счёту и кассам с 1 по 23 ноября
        </p>
      </header>

      {dialog.questions.map((question, i) => (
        <React.Fragment key={i}>
          <UserMessage text={question} time={dialog.times[i]} />
          {i < answered && (
            <div className="future-answer ts-500-s">{ANSWERS[i]?.(onAsk, i === answered - 1 && !isCardOffered)}</div>
          )}
        </React.Fragment>
      ))}

      {isThinking && (
        <p className="future-thinking ts-400-s">
          <Spinner className="future-thinking__spinner" />
          Разбираюсь…
        </p>
      )}

      {isCardOffered && (
        <>
          <div className="future-offer">
            <p className="ts-500-s">
              Хотите, добавлю на главную карточку, чтобы следить за этими долями? Покажу продукты и зарплату по каждой
              точке и предупрежу, если продукты где-то выйдут за 33%.
            </p>
            <div className="future-offer__widget">
              <FutureWidget id="products-salary" state="proposed" />
            </div>
            {dialog.card === 'pending' && (
              <div className="future-buttons">
                <Button variant="secondary" size="s" isHugWidth className="future-button--inverse" onClick={() => onCardDecision('added')}>
                  Добавить на главную
                </Button>
                <Button variant="secondary" size="s" isHugWidth>
                  Изменить порог
                </Button>
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
                    <span className="ts-400-s">Карточка «Продукты и зарплата» на главной</span>
                    <button type="button" className="future-done__link ts-500-s hoverOpacity" onClick={onOpenHome}>
                      Открыть главную
                      <span className="ds-icon" aria-hidden="true">
                        <ArrowRight />
                      </span>
                    </button>
                  </div>
                  <p>
                    Готово. Обновляю каждый день, итоги ноября пришлю 1 декабря. Этот разговор останется в истории
                    слева — к нему можно вернуться из карточки через «⋯».
                  </p>
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
