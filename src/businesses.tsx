import React from 'react';
import { Card, FollowUps, LineChart, Note, SegmentedBar, Table } from './components/future/answerParts';
import {
  AssistantThread,
  BusinessId,
  BusinessState,
  DialogState,
  EMPTY_DIALOG,
  FutureWidgetId,
} from './future';
import type { InsightSettings } from './insights';

/**
 * Сценарии концепта по типам бизнеса: о чём клиент спрашивает, что ассистент предлагает сам
 * и как главная обрастает виджетами. Ассистент отвечает по сценарию — это прототип.
 */

export interface AnswerContext {
  /** Задать следующий вопрос сценария — для чипов-подсказок */
  ask: (question: string) => void;
  /** Это последний ответ в ветке — подсказки показываем только под ним */
  isLast: boolean;
  /** Следующий вопрос сценария */
  next?: string;
  /** Вопрос, на который отвечаем, — как клиент его написал */
  question: string;
}

export interface DialogDef {
  id: string;
  title: string;
  /** Подзаголовок ветки после времени: откуда данные */
  source: string;
  /** Ключевые слова — вопрос с главной попадает в этот разговор */
  keywords: RegExp;
  questions: string[];
  answers: ((ctx: AnswerContext) => React.ReactNode)[];
  /** Реплика ассистента до первого вопроса — в ветке «Изменить» виджета */
  intro?: React.ReactNode;
  /** В конце разговора ассистент предлагает закрепить виджет */
  offer?: { text: string; widget: FutureWidgetId; addedText: string };
  /** Ветка правки виджета — не подсказывается и не ловит вопросы с главной */
  isEdit?: boolean;
  /** Когда разговор становится актуальным — пока нет, его вопрос не подсказывается */
  isAvailable?: (s: BusinessState) => boolean;
}

export interface ProposalDef {
  id: string;
  text: string;
  widget: FutureWidgetId;
  accept: string;
  isAvailable: (s: BusinessState, settings: InsightSettings) => boolean;
  /** Что можно поменять в виджете — подсказки в ветке «Изменить» */
  editIdeas: string[];
}

/** Реплика ассистента на главной, когда предлагать нечего; кнопки ставят флаг */
export interface HomeLine {
  text: string;
  actions?: { label: string; flag: string; isPrimary?: boolean }[];
}

export interface BusinessDef {
  id: BusinessId;
  /** Имя в приветствии */
  name: string;
  threads: AssistantThread[];
  dialogs: DialogDef[];
  proposals: ProposalDef[];
  homeLine: (s: BusinessState) => HomeLine;
  money: (s: BusinessState) => string;
  /** Этапы для демо — состояние главной через 2 недели, 2 месяца, полгода */
  stages?: { label: string; state: () => BusinessState }[];
}

/* ---------- Кофейни ---------- */

const COFFEE_QUESTIONS = [
  'Сколько у нас уходит на продукты и зарплату?',
  'Да, почему на Арбате продукты 37%?',
  'А зарплата это нормально? Сколько вообще должно быть у кофейни?',
  'Понятно. Сокращу заказ выпечки на Арбате, а молоко попробую у Фермерского',
];

const COFFEE: BusinessDef = {
  id: 'coffee',
  name: 'Тимур',
  threads: [
    { id: 'bank-docs', title: 'Документы для банка', status: 'working' },
    { id: 'petrova-profit', title: 'Прибыль по Петровой', status: 'unread' },
    { id: 'expenses-growth', title: 'Почему выросли расходы', status: 'read' },
    { id: 'quarter-analytics', title: 'Аналитика за квартал', status: 'read' },
  ],
  dialogs: [
    {
      id: 'products-salary',
      title: 'Сколько уходит на продукты и зарплату',
      source: 'данные по счёту и кассам с 1 по 23 ноября',
      keywords: /продукт|зарплат|расход|уходит/i,
      questions: COFFEE_QUESTIONS,
      answers: [
        ({ ask, isLast, next }) => (
          <>
            <p>
              За ноябрь, с 1 по 23 число, кофейни заработали <b>3 410 000 ₽</b>. На продукты ушло 31%, на зарплату —
              29%. Остаётся 40% на аренду, налоги и прибыль.
            </p>
            <Card title="Куда уходит выручка" aside="3 410 000 ₽">
              <SegmentedBar
                segments={[
                  { label: 'Продукты', amount: '1 057 100 ₽', share: 31, color: 'var(--category-indigo)' },
                  { label: 'Зарплата', amount: '988 900 ₽', share: 29, color: 'var(--category-emerald)' },
                  { label: 'Остальное', amount: '1 364 000 ₽', share: 40, color: 'var(--bg-neutral-4)' },
                ]}
              />
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
              <FollowUps items={['Почему на Арбате дороже', 'Сравнить с октябрём', 'Показать поставщиков']} question={next} onAsk={ask} />
            )}
          </>
        ),
        ({ isLast }) => (
          <>
            <p>Две причины, обе поправимые.</p>
            <p>
              <b>1. Молоко дороже на четверть.</b> Арбат берёт у «Молочного двора» по 112 ₽ за литр, Пятницкая —
              у «Фермерского» по 89 ₽. При 1 200 литрах в месяц это ≈ 134 000 ₽ против 107 000 ₽.
            </p>
            <p>
              <b>2. Много выпечки уходит в списание.</b> Заказ выпечки на обеих точках одинаковый, а гостей на Арбате
              пока вдвое меньше.
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
              Если перевести Арбат на «Фермерского» и сократить заказ выпечки на треть, продукты опустятся примерно до
              32%. Это ≈ 55 000 ₽ в месяц.
            </p>
            {isLast && <FollowUps items={['Написать «Фермерскому» про вторую точку', 'Как сократить списания']} />}
          </>
        ),
        () => (
          <>
            <p>Обычно у кофеен продукты занимают 25–35% выручки, зарплата — 25–30%. Пятницкая в норме по обоим.</p>
            <p>
              На Арбате зарплата 33%, но это нормально для точки, которая работает четвёртую неделю: смена полная, а
              гостей ещё мало. Доля падает каждую неделю — если рост выручки сохранится, к середине декабря Арбат выйдет
              на 28–29%.
            </p>
            <Card title="Зарплата на Арбате, доля от выручки по неделям">
              <LineChart
                nowIndex={3}
                points={[
                  { label: '1 нед · 48%', value: 48 },
                  { label: '2 нед', value: 42 },
                  { label: '3 нед', value: 37 },
                  { label: 'сейчас · 33%', value: 33 },
                  { label: 'прогноз', value: 30.5 },
                  { label: 'сер. дек · 28%', value: 28 },
                ]}
              />
            </Card>
            <Note>Норма — по данным кофеен на обслуживании в Точке, без названий и сумм конкретных компаний</Note>
          </>
        ),
        () => <p>Хороший план. Через пару недель станет видно, сработало ли.</p>,
      ],
      offer: {
        text:
          'Хотите, добавлю на главную карточку, чтобы следить за этими долями? Покажу продукты и зарплату по каждой точке и предупрежу, если продукты где-то выйдут за 33%.',
        widget: 'products-salary',
        addedText:
          'Готово. Обновляю каждый день, итоги ноября пришлю 1 декабря. Этот разговор останется в истории слева — к нему можно вернуться из карточки через «⋯».',
      },
    },
  ],
  proposals: [
    {
      id: 'revenue',
      text: 'Вы подключили эквайринг и кассу — могу показывать выручку за сегодня и статус терминалов',
      widget: 'revenue',
      accept: 'Хорошо, оставляй',
      editIdeas: ['Показывай выручку по точкам', 'Добавь сравнение со вчера'],
      // Момент для предложения выбирается в настройках прототипа
      isAvailable: (_s, settings) => settings.futureAssistant === 'proposal',
    },
  ],
  homeLine: () => ({ text: 'Всё спокойно. Если что-то изменится — скажу.' }),
  money: () => '3 422 785,37 ₽',
};

/* ---------- ИП-одиночка: дизайнер, репетитор, мастер ---------- */

const WITHDRAW_QUESTIONS = [
  'Сколько я могу вывести себе, чтобы хватило на налог?',
  'Из чего складывается резерв 39 200 ₽?',
];

const YEAR_TAX_QUESTIONS = ['Сколько налога я должна заплатить за год?', 'Когда и как это платить?'];

const SOLO_DIALOGS: DialogDef[] = [
  {
    id: 'withdraw',
    title: 'Сколько можно вывести себе',
    source: 'данные по счёту и налогам за IV квартал',
    keywords: /вывест|себе|забрать|снять|перевест/i,
    questions: WITHDRAW_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>
            Сейчас можно спокойно вывести <b>186 400 ₽</b> — и на налог, и на обычные расходы хватит. Вот как считал:
          </p>
          <Card title="Можно вывести себе" aside="сегодня">
            <Table
              head={['', '']}
              rows={[
                { cells: ['На счёте', '240 000 ₽'] },
                { cells: ['Отложить на налог 6% с оплат IV квартала', '−14 400 ₽'] },
                { cells: ['Резерв на месяц', '−39 200 ₽'] },
                { cells: ['Можно вывести', '186 400 ₽'], isTotal: true },
              ]}
            />
          </Card>
          <Note>Налог считаю только с оплат от клиентов. Переводы себе налогом не облагаются</Note>
          <p>Резерв — это ваши обычные расходы за месяц. Показать, из чего он?</p>
          {isLast && <FollowUps items={['Из чего резерв', 'А если вывести всё?']} question={next} onAsk={ask} />}
        </>
      ),
      () => (
        <>
          <p>Это средние расходы за последние 3 месяца — то, что списывается каждый месяц, даже если заказов нет:</p>
          <Card title="Резерв на месяц" aside="39 200 ₽">
            <SegmentedBar
              segments={[
                { label: 'Аренда студии', amount: '18 000 ₽', share: 18, color: 'var(--category-indigo)' },
                { label: 'Бухгалтерия', amount: '9 000 ₽', share: 9, color: 'var(--category-emerald)' },
                { label: 'Софт и подписки', amount: '9 700 ₽', share: 9.7, color: 'var(--category-amethyst)' },
                { label: 'Связь', amount: '2 500 ₽', share: 2.5, color: 'var(--bg-neutral-4)' },
              ]}
            />
          </Card>
          <p>Если в каком-то месяце заказов будет мало, резерв закроет эти расходы и налоговые деньги трогать не придётся.</p>
        </>
      ),
    ],
    offer: {
      text: 'Хотите, буду показывать эту сумму на главной? Пересчитаю после каждой оплаты от клиентов.',
      widget: 'withdraw',
      addedText: 'Готово. Сумма обновляется после каждой оплаты. Этот разговор останется в истории слева.',
    },
  },
  {
    id: 'year-tax',
    title: 'Сколько налога за год',
    source: 'данные по счёту и налоговому фонду за 2026',
    keywords: /налог|усн|взнос/i,
    questions: YEAR_TAX_QUESTIONS,
    // Про налог за год спрашивают ближе к концу года — после первых счетов
    isAvailable: (s) => s.decided.includes('debtors'),
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>
            За 2026 начислено <b>86 100 ₽</b> — это 6% с 1 435 000 ₽ дохода. Авансами за три квартала вы уже
            заплатили 64 600 ₽, осталось 21 500 ₽.
          </p>
          <Card title="Налог за 2026" aside="86 100 ₽">
            <SegmentedBar
              segments={[
                { label: 'Уже заплатили', amount: '64 600 ₽', share: 64.6, color: 'var(--category-emerald)' },
                { label: 'Отложено в фонде', amount: '21 500 ₽', share: 21.5, color: 'var(--category-mint)' },
              ]}
            />
          </Card>
          <Note>Взносы за себя учёл — они уменьшили налог на 49 500 ₽</Note>
          <p>Остаток уже лежит в фонде «Налоги»: откладываю туда 6% с каждой оплаты.</p>
          {isLast && <FollowUps items={['Когда платить', 'Как уменьшить налог']} question={next} onAsk={ask} />}
        </>
      ),
      () => (
        <>
          <p>
            Платежей два. Подготовлю их заранее и напомню за неделю — останется только подписать.
          </p>
          <Card>
            <Table
              head={['Что', 'Срок', 'Сумма']}
              rows={[
                { cells: ['УСН за 2026', 'до 28 апреля 2027', '21 500 ₽'] },
                { cells: ['1% взносов с дохода сверх 300 000 ₽', 'до 1 июля 2027', '11 350 ₽'] },
              ]}
            />
          </Card>
          <Note>Оба платежа — на единый налоговый счёт, деньги на них уже в фонде</Note>
        </>
      ),
    ],
    offer: {
      text: 'Хотите, добавлю на главную карточку налогов? Покажу, сколько начислено, заплачено и отложено.',
      widget: 'taxes',
      addedText: 'Готово. Карточка обновится после каждой оплаты и налогового платежа.',
    },
  },
];

/** Разговор пройден до конца и карточка добавлена — для этапов демо */
const doneDialog = (questions: string[]): DialogState => ({
  questions,
  times: questions.map(() => '10:12'),
  card: 'added',
  cardTime: '10:14',
});

const SOLO_THREADS: AssistantThread[] = [
  { id: 'act-leto', title: 'Акт сверки с Кафе «Лето»', status: 'working' },
  { id: 'invoice-pixel', title: 'Счёт для «Пикселя»', status: 'unread' },
  { id: 'contributions', title: 'Как платить взносы', status: 'read' },
];

const soloThreadsWith = (ids: string[]): AssistantThread[] => [
  ...SOLO_DIALOGS.filter((d) => ids.includes(d.id))
    .reverse()
    .map((d) => ({ id: d.id, title: d.title, status: 'read' as const })),
  ...SOLO_THREADS,
];

const SOLO: BusinessDef = {
  id: 'solo',
  name: 'Анна',
  threads: SOLO_THREADS,
  dialogs: SOLO_DIALOGS,
  proposals: [
    {
      id: 'debtors',
      text: 'Вы выставили 5 счетов, 3 ещё не оплачены. Показывать, кто должен?',
      widget: 'debtors',
      accept: 'Добавить на главную',
      editIdeas: ['Покажи, сколько дней просрочки', 'Добавь кнопку «Напомнить»'],
      isAvailable: (s) => s.pinned.includes('withdraw'),
    },
    {
      id: 'self-transfer',
      text: 'Каждую пятницу вы переводите себе деньги вручную. Делать это автоматически — за вычетом налога?',
      widget: 'self-transfer',
      accept: 'Настроить',
      editIdeas: ['Переводи по понедельникам', 'Оставляй резерв 50 000 ₽'],
      // После разговора о налогах и ответа про должника
      isAvailable: (s) => s.pinned.includes('taxes') && s.flags.some((f) => f.startsWith('remind')),
    },
    {
      id: 'clients',
      text: 'Посмотреть, какие клиенты приносят больше всего?',
      widget: 'clients',
      accept: 'Добавить на главную',
      editIdeas: ['Покажи за последние 3 месяца', 'Добавь, кто платит с опозданием'],
      isAvailable: (s) => s.decided.includes('self-transfer'),
    },
  ],
  homeLine: (s) => {
    if (s.pinned.includes('debtors') && !s.flags.some((f) => f.startsWith('remind'))) {
      return {
        text: 'Кафе «Лето» не оплатило счёт 5 дней — напомнить?',
        actions: [
          { label: 'Напомнить', flag: 'remind-sent', isPrimary: true },
          { label: 'Не сейчас', flag: 'remind-skipped' },
        ],
      };
    }
    if (s.pinned.includes('self-transfer')) return { text: 'Всё спокойно. В пятницу переведу вам 46 000 ₽.' };
    if (s.flags.includes('remind-sent')) return { text: 'Напомнил Кафе «Лето» про счёт — письмо ушло. Остальное спокойно.' };
    return { text: 'Пришла оплата от «Пиксель» — 60 000 ₽. Всё спокойно.' };
  },
  money: (s) =>
    s.decided.includes('self-transfer') ? '418 000 ₽' : s.pinned.includes('debtors') ? '312 000 ₽' : '240 000 ₽',
  stages: [
    { label: 'Старт', state: () => initialState(SOLO) },
    {
      label: '2 недели',
      state: () => ({
        ...initialState(SOLO),
        threads: soloThreadsWith(['withdraw']),
        pinned: ['withdraw'],
        dialogs: { withdraw: doneDialog(WITHDRAW_QUESTIONS) },
      }),
    },
    {
      label: '2 месяца',
      state: () => ({
        ...initialState(SOLO),
        threads: soloThreadsWith(['withdraw', 'year-tax']),
        pinned: ['withdraw', 'debtors', 'taxes'],
        decided: ['debtors'],
        dialogs: { withdraw: doneDialog(WITHDRAW_QUESTIONS), 'year-tax': doneDialog(YEAR_TAX_QUESTIONS) },
      }),
    },
    {
      label: 'Полгода',
      state: () => ({
        ...initialState(SOLO),
        threads: soloThreadsWith(['withdraw', 'year-tax']),
        pinned: ['withdraw', 'debtors', 'taxes', 'self-transfer'],
        decided: ['debtors', 'self-transfer'],
        flags: ['remind-sent'],
        dialogs: { withdraw: doneDialog(WITHDRAW_QUESTIONS), 'year-tax': doneDialog(YEAR_TAX_QUESTIONS) },
      }),
    },
  ],
};

/**
 * «⋯ → Изменить» у виджета из предложения ассистента: своя ветка, где ассистент спрашивает,
 * что поменять. Виджеты из разговоров правятся в том разговоре, где их собрали.
 */
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

const editDialog = (p: ProposalDef, widgetTitle: string): DialogDef => ({
  id: `edit-${p.widget}`,
  title: `Карточка «${widgetTitle}»`,
  source: 'настройка карточки на главной',
  keywords: /$^/,
  isEdit: true,
  intro: (
    <p>
      Что поменять в карточке «{widgetTitle}»? Можно попросить своими словами — например, «{lowerFirst(p.editIdeas[0])}»
      или «{lowerFirst(p.editIdeas[1])}».
    </p>
  ),
  questions: p.editIdeas,
  answers: p.editIdeas.map(() => ({ question }: AnswerContext) => (
    <p>
      Принято: «{question}». Поменяю карточку «{widgetTitle}» — на главной она обновится после следующего пересчёта.
    </p>
  )),
});

const WIDGET_TITLES: Record<FutureWidgetId, string> = {
  revenue: 'Выручка',
  'products-salary': 'Продукты и зарплата',
  withdraw: 'Можно вывести себе',
  debtors: 'Мне должны',
  taxes: 'Налоги',
  clients: 'Клиенты за год',
  'self-transfer': 'Перевод себе',
};

const withEditDialogs = (def: BusinessDef): BusinessDef => ({
  ...def,
  dialogs: [...def.dialogs, ...def.proposals.map((p) => editDialog(p, WIDGET_TITLES[p.widget]))],
});

export const BUSINESSES: Record<BusinessId, BusinessDef> = {
  coffee: withEditDialogs(COFFEE),
  solo: withEditDialogs(SOLO),
};

/** Ветка, где правят виджет: разговор, в котором его собрали, или отдельная ветка «Карточка «…»» */
export const editDialogOf = (def: BusinessDef, widget: FutureWidgetId) =>
  def.dialogs.find((d) => d.offer?.widget === widget) ?? def.dialogs.find((d) => d.id === `edit-${widget}`);

export function initialState(def: BusinessDef): BusinessState {
  return { threads: def.threads, pinned: [], decided: [], dialogs: {}, flags: [] };
}

export const DEFAULT_FUTURE_STATE = {
  coffee: initialState(COFFEE),
  solo: initialState(SOLO),
};

export const dialogStateOf = (s: BusinessState, id: string): DialogState => s.dialogs[id] ?? EMPTY_DIALOG;

/** Что ассистент предлагает на главной прямо сейчас — первое актуальное, на что клиент ещё не ответил */
export const currentProposal = (def: BusinessDef, s: BusinessState, settings: InsightSettings) =>
  def.proposals.find(
    (p) => !s.decided.includes(p.id) && !s.pinned.includes(p.widget) && p.isAvailable(s, settings),
  );

/** Разговор, который ещё не начинали, — его первый вопрос подсказывается в поле на главной */
export const nextDialog = (def: BusinessDef, s: BusinessState) =>
  def.dialogs.find((d) => !d.isEdit && dialogStateOf(s, d.id).questions.length === 0 && (d.isAvailable?.(s) ?? true));

/** Вопрос с главной: в разговор по ключевым словам, иначе — в следующий по сценарию */
export function routeQuestion(def: BusinessDef, s: BusinessState, question: string): DialogDef | undefined {
  const unfinished = def.dialogs.filter((d) => !d.isEdit && dialogStateOf(s, d.id).questions.length < d.questions.length);
  return (
    unfinished.find((d) => d.keywords.test(question) && (d.isAvailable?.(s) ?? true)) ??
    nextDialog(def, s) ??
    unfinished[0]
  );
}

