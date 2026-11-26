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

/* ---------- Селлер на маркетплейсах ---------- */

const MARKET_PAYOUT_QUESTIONS = [
  'Когда придут выплаты от Ozon и Wildberries?',
  'Сколько всего придёт в этом месяце?',
];
const MARKET_PROFIT_QUESTIONS = [
  'Сколько я зарабатываю на каждом товаре?',
  'Какие товары приносят больше всего?',
];
const MARKET_HOLDBACK_QUESTIONS = [
  'Почему площадки столько удержали?',
  'На чём можно сэкономить?',
];
const MARKET_STOCK_QUESTIONS = [
  'Сколько денег нужно на закупку к Новому году?',
  'А если продажи вырастут?',
];
const MARKET_INVENTORY_QUESTIONS = ['На сколько дней хватит остатков?', 'Что пора заказать в первую очередь?'];
const MARKET_AD_QUESTIONS = ['Сколько уходит на рекламу и что она приносит?', 'Какие товары рекламировать выгоднее?'];

const MARKETPLACE_DIALOGS: DialogDef[] = [
  {
    id: 'market-payouts',
    title: 'Выплаты от Ozon и Wildberries',
    source: 'отчёты маркетплейсов и движения по счёту',
    keywords: /выплат|ozon|озон|wildberries|вай|поступ|когда придут/i,
    questions: MARKET_PAYOUT_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>Ближайшая выплата от Ozon — <b>412 300 ₽, 12 ноября</b>. Wildberries перечислит 286 900 ₽ 14 ноября.</p>
          <Card title="Ожидаемые выплаты" aside="ноябрь">
            <Table head={['Площадка', 'Дата', 'Сумма']} rows={[
              { cells: ['Ozon', '12 ноября', '412 300 ₽'] },
              { cells: ['Wildberries', '14 ноября', '286 900 ₽'] },
            ]} />
          </Card>
          <Note>Даты и суммы пересчитаю, когда площадки опубликуют новые отчёты</Note>
          <p>Показывать такие выплаты на главной?</p>
          {isLast && <FollowUps items={['Показывать выплаты на главной', 'Сколько придёт за месяц']} question={next} onAsk={ask} />}
        </>
      ),
      () => (
        <>
          <p>В ноябре ожидается <b>1 284 600 ₽</b> от двух площадок. Из этой суммы 699 200 ₽ уже в обработке.</p>
          <Card title="Поступления за ноябрь" aside="прогноз">
            <SegmentedBar segments={[
              { label: 'Ozon', amount: '742 300 ₽', share: 58, color: 'var(--category-indigo)' },
              { label: 'Wildberries', amount: '542 300 ₽', share: 42, color: 'var(--category-emerald)' },
            ]} />
          </Card>
          <p>Учту комиссии и возможные корректировки после финального отчёта.</p>
        </>
      ),
    ],
    offer: {
      text: 'Хотите, добавлю выплаты на главную? Буду показывать, когда и сколько перечислит каждая площадка.',
      widget: 'market-payouts',
      addedText: 'Готово. Обновляю прогноз по мере появления новых отчётов и поступлений.',
    },
  },
  {
    id: 'market-profit',
    title: 'Прибыль по товарам',
    source: 'отчёты о продажах, комиссиях и логистике за октябрь',
    keywords: /прибыл|маржин|товар|что принос|зарабатыва/i,
    questions: MARKET_PROFIT_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>После комиссии, логистики и рекламы осталось <b>612 000 ₽</b>. Складные стулья дают больше всего, а подставка из бамбука продаётся в минус.</p>
          <Card title="Прибыль по товарам" aside="октябрь">
            <Table head={['Товар', 'Продажи', 'Прибыль']} rows={[
              { cells: ['Складные стулья', '1 240 000 ₽', '+148 000 ₽'] },
              { cells: ['Набор контейнеров', '890 000 ₽', '+96 000 ₽'] },
              { cells: ['Подставка бамбук', '186 000 ₽', '−18 400 ₽'], high: [2] },
            ]} />
          </Card>
          <Note>Считаю после комиссии площадки, логистики, хранения и рекламы</Note>
          <p>Разобрать товары подробнее?</p>
          {isLast && <FollowUps items={['Показывать прибыль на главной', 'Почему подставка в минусе']} question={next} onAsk={ask} />}
        </>
      ),
      () => (
        <>
          <p>Больше всего прибыли приносят складные стулья: <b>148 000 ₽</b> за месяц. Контейнеры дают стабильную маржу, а подставку стоит пересчитать по цене или остановить рекламу.</p>
          <Card title="Что влияет на результат">
            <Table head={['Товар', 'Маржа', 'Изменение к сентябрю']} rows={[
              { cells: ['Складные стулья', '18%', '+3 п.п.'] },
              { cells: ['Набор контейнеров', '11%', 'без изменений'] },
              { cells: ['Подставка бамбук', '−10%', '−6 п.п.'], high: [1, 2] },
            ]} />
          </Card>
          <p>Могу следить за прибылью по каждому товару и отмечать, если она уходит ниже нуля.</p>
        </>
      ),
    ],
    offer: {
      text: 'Добавить на главную прибыль по товарам? Покажу продажи, расходы и чистый результат.',
      widget: 'market-profit',
      addedText: 'Готово. Прибыль пересчитывается после загрузки отчётов площадок.',
    },
  },
  {
    id: 'market-holdbacks',
    title: 'Удержания площадок',
    source: 'отчёты Ozon и Wildberries за октябрь',
    keywords: /удерж|комисс|логист|расход площад|списал|сэконом/i,
    questions: MARKET_HOLDBACK_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>В октябре площадки удержали <b>1,02 млн ₽</b> — это 38% продаж. Больше всего ушло на комиссии и логистику.</p>
          <Card title="Из чего состоят удержания" aside="октябрь">
            <Table head={['Статья', 'Сумма', 'Доля']} rows={[
              { cells: ['Комиссия', '459 000 ₽', '45%'] },
              { cells: ['Логистика и хранение', '357 000 ₽', '35%'] },
              { cells: ['Продвижение', '204 000 ₽', '20%'] },
            ]} />
          </Card>
          <p>Сравнить с прошлым месяцем и найти, где расходы выросли?</p>
          {isLast && <FollowUps items={['Следить за удержаниями', 'Сравнить с сентябрём']} question={next} onAsk={ask} />}
        </>
      ),
      () => (
        <>
          <p>Расходы на хранение выросли на <b>18%</b>: два товара лежат на складе дольше 45 дней. Если переместить запас на склад ближе к покупателям, логистика может снизиться примерно на 32 000 ₽.</p>
          <Card title="Где выросли расходы">
            <Table head={['Статья', 'Сентябрь', 'Октябрь']} rows={[
              { cells: ['Хранение', '81 000 ₽', '95 600 ₽'], high: [2] },
              { cells: ['Логистика', '248 000 ₽', '261 400 ₽'], high: [2] },
              { cells: ['Комиссия', '451 000 ₽', '459 000 ₽'] },
            ]} />
          </Card>
          <Note>Оценка экономии — по текущим тарифам и географии заказов</Note>
        </>
      ),
    ],
    offer: {
      text: 'Могу вынести удержания на главную и показывать комиссию, логистику и рекламу отдельно.',
      widget: 'market-holdbacks',
      addedText: 'Готово. Подсвечу, если доля удержаний заметно изменится.',
    },
  },
  {
    id: 'market-stock',
    title: 'Закупка к Новому году',
    source: 'продажи за прошлый год, темп продаж и текущие остатки',
    keywords: /закуп|новому году|остат|склад|заказать|запас/i,
    questions: MARKET_STOCK_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>Чтобы поддержать продажи до конца декабря, понадобится около <b>1,3 млн ₽</b> на закупку. Сейчас на счёте 1,1 млн ₽ — не хватает примерно 200 000 ₽.</p>
          <Card title="План закупки" aside="до 1 декабря">
            <Table head={['', 'Сумма']} rows={[
              { cells: ['Складные стулья', '720 000 ₽'] },
              { cells: ['Набор контейнеров', '430 000 ₽'] },
              { cells: ['Запас на рост спроса', '150 000 ₽'] },
              { cells: ['Всего', '1 300 000 ₽'], isTotal: true },
            ]} />
          </Card>
          <p>Показывать план и сколько ещё нужно накопить?</p>
          {isLast && <FollowUps items={['Добавить план закупки', 'Если спрос вырастет на 20%']} question={next} onAsk={ask} />}
        </>
      ),
      () => (
        <>
          <p>При росте продаж на 20% закупку лучше увеличить до <b>1,55 млн ₽</b>. Основной запас направить на складные стулья — по текущему темпу их хватит на 9 дней.</p>
          <Card title="Сценарии закупки">
            <Table head={['Сценарий', 'Сумма', 'Запас']} rows={[
              { cells: ['Текущий спрос', '1,3 млн ₽', '14 дней'] },
              { cells: ['Рост на 20%', '1,55 млн ₽', '18 дней'] },
            ]} />
          </Card>
        </>
      ),
    ],
    offer: {
      text: 'Добавить план закупки на главную? Буду обновлять его по остаткам и прогнозу продаж.',
      widget: 'market-stock',
      addedText: 'Готово. Покажу целевой бюджет и сколько осталось до закупки.',
    },
  },
  {
    id: 'market-inventory',
    title: 'Остатки на складах',
    source: 'остатки Ozon и Wildberries и средние продажи',
    keywords: /сколько дней|хватит|остат|заканчива|склад/i,
    questions: MARKET_INVENTORY_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>По текущему темпу складных стульев хватит примерно на <b>9 дней</b>, контейнеров — на 24 дня. Заказы в пути учёл.</p>
          <Card title="Запас по товарам">
            <Table head={['Товар', 'На складе', 'Хватит на']} rows={[
              { cells: ['Складные стулья', '124 шт.', '9 дней'], high: [2] },
              { cells: ['Набор контейнеров', '306 шт.', '24 дня'] },
              { cells: ['В пути', '240 шт.', 'до 18 ноября'] },
            ]} />
          </Card>
          {isLast && <FollowUps items={['Показывать остатки на главной', 'Что заказать первым']} question={next} onAsk={ask} />}
        </>
      ),
      () => <p>В первую очередь закажите складные стулья: их запас закончится раньше следующей поставки. Могу напомнить, когда остаток опустится до 5 дней продаж.</p>,
    ],
    offer: {
      text: 'Добавить остатки на главную? Отмечу товары, которых скоро не хватит.',
      widget: 'market-inventory',
      addedText: 'Готово. Остатки обновляются после отчётов площадок и отгрузок.',
    },
  },
  {
    id: 'market-ads',
    title: 'Реклама товаров',
    source: 'расходы на продвижение и продажи за октябрь',
    keywords: /реклам|продвиж|ддр|окупаем/i,
    questions: MARKET_AD_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>В октябре на рекламу ушло <b>204 000 ₽</b>, с неё пришло продаж на 786 000 ₽. Средняя ДРР — 26%.</p>
          <Card title="Результат продвижения" aside="октябрь">
            <Table head={['Товар', 'Расходы', 'Продажи']} rows={[
              { cells: ['Складные стулья', '82 000 ₽', '410 000 ₽'] },
              { cells: ['Контейнеры', '64 000 ₽', '286 000 ₽'] },
              { cells: ['Подставка бамбук', '58 000 ₽', '90 000 ₽'], high: [1, 2] },
            ]} />
          </Card>
          {isLast && <FollowUps items={['Следить за рекламой на главной', 'Что продвигать выгоднее']} question={next} onAsk={ask} />}
        </>
      ),
      () => <p>Складные стулья окупают продвижение лучше остальных. У подставки расходы почти сравнялись с продажами — бюджет стоит сократить.</p>,
    ],
    offer: {
      text: 'Добавить на главную эффективность рекламы? Покажу расходы, продажи и долю рекламных затрат.',
      widget: 'market-ads',
      addedText: 'Готово. Обновляю показатели по отчётам рекламных кампаний.',
    },
  },
];

const MARKET_THREADS: AssistantThread[] = [
  { id: 'market-docs', title: 'Отчёт площадки за октябрь', status: 'working' },
  { id: 'market-return', title: 'Возвраты выросли на Ozon', status: 'unread' },
  { id: 'market-warehouse', title: 'Склад ближе к покупателям', status: 'read' },
];

const marketplaceThreadsWith = (ids: string[]): AssistantThread[] => [
  ...MARKETPLACE_DIALOGS.filter((d) => ids.includes(d.id))
    .reverse()
    .map((d) => ({ id: d.id, title: d.title, status: 'read' as const })),
  ...MARKET_THREADS,
];

const MARKETPLACE: BusinessDef = {
  id: 'marketplace',
  name: 'Марина',
  threads: MARKET_THREADS,
  dialogs: MARKETPLACE_DIALOGS,
  proposals: [
    {
      id: 'market-profit',
      text: 'По отчётам видно, что товары приносят разную прибыль. Показать результат по каждому на главной?',
      widget: 'market-profit',
      accept: 'Добавить на главную',
      editIdeas: ['Показывай только товары в минусе', 'Сравнивай с прошлым месяцем'],
      isAvailable: (s) => s.pinned.includes('market-payouts'),
    },
    {
      id: 'market-holdbacks',
      text: 'Удержания площадок выросли. Разложить комиссию, логистику и продвижение по отдельности?',
      widget: 'market-holdbacks',
      accept: 'Показывать удержания',
      editIdeas: ['Сравнивай с прошлым месяцем', 'Подсвечивай рост выше 10%'],
      isAvailable: (s) => s.pinned.includes('market-profit'),
    },
    {
      id: 'market-stock',
      text: 'До Нового года спрос обычно растёт. Рассчитать бюджет закупки под ваши остатки и продажи?',
      widget: 'market-stock',
      accept: 'Добавить план закупки',
      editIdeas: ['Рассчитай запас на 3 недели', 'Оставь резерв 200 000 ₽'],
      isAvailable: (s) => s.pinned.includes('market-holdbacks'),
    },
    {
      id: 'market-inventory',
      text: 'У складных стульев осталось примерно 9 дней запаса. Показывать остатки и срок до пополнения?',
      widget: 'market-inventory',
      accept: 'Следить за остатками',
      editIdeas: ['Предупреждай за 5 дней', 'Учитывай товары в пути'],
      isAvailable: (s) => s.pinned.includes('market-stock'),
    },
    {
      id: 'market-ads',
      text: 'Могу сравнить расходы на рекламу с продажами по каждому товару и подсказать, где бюджет окупается.',
      widget: 'market-ads',
      accept: 'Добавить аналитику рекламы',
      editIdeas: ['Показывай ДРР по площадкам', 'Подсвечивай кампании в минусе'],
      isAvailable: (s) => s.pinned.includes('market-inventory'),
    },
  ],
  homeLine: (s) => {
    if (s.pinned.includes('market-inventory')) {
      return { text: 'По складным стульям запас на 9 дней — проверьте план поставки. Остальные показатели в норме.' };
    }
    if (s.pinned.includes('market-payouts')) {
      return { text: 'Ближайшая выплата Ozon — 412 300 ₽ 12 ноября. Всё спокойно.' };
    }
    return {
      text: 'Счёт открыт. Подключите кабинеты Ozon и Wildberries — буду собирать выплаты, комиссии и остатки в одном месте.',
    };
  },
  money: (s) => (s.pinned.includes('market-payouts') ? '1 184 600 ₽' : '0 ₽'),
  stages: [
    { label: 'День 1', state: () => initialState(MARKETPLACE) },
    {
      label: '2 недели',
      state: () => ({
        ...initialState(MARKETPLACE),
        threads: marketplaceThreadsWith(['market-payouts']),
        pinned: ['market-payouts'],
        dialogs: { 'market-payouts': doneDialog(MARKET_PAYOUT_QUESTIONS) },
      }),
    },
    {
      label: '2 месяца',
      state: () => ({
        ...initialState(MARKETPLACE),
        threads: marketplaceThreadsWith(['market-payouts', 'market-profit', 'market-holdbacks']),
        pinned: ['market-payouts', 'market-profit', 'market-holdbacks'],
        dialogs: {
          'market-payouts': doneDialog(MARKET_PAYOUT_QUESTIONS),
          'market-profit': doneDialog(MARKET_PROFIT_QUESTIONS),
          'market-holdbacks': doneDialog(MARKET_HOLDBACK_QUESTIONS),
        },
      }),
    },
    {
      label: 'Полгода',
      state: () => ({
        ...initialState(MARKETPLACE),
        threads: marketplaceThreadsWith(['market-payouts', 'market-profit', 'market-holdbacks', 'market-stock', 'market-inventory']),
        pinned: ['market-payouts', 'market-profit', 'market-stock', 'market-inventory', 'market-holdbacks'],
        dialogs: {
          'market-payouts': doneDialog(MARKET_PAYOUT_QUESTIONS),
          'market-profit': doneDialog(MARKET_PROFIT_QUESTIONS),
          'market-holdbacks': doneDialog(MARKET_HOLDBACK_QUESTIONS),
          'market-stock': doneDialog(MARKET_STOCK_QUESTIONS),
          'market-inventory': doneDialog(MARKET_INVENTORY_QUESTIONS),
        },
      }),
    },
  ],
};

/* ---------- Директор компании ---------- */

const DIRECTOR_APPROVAL_QUESTIONS = ['Покажи, какие платежи ждут подписи', 'Сколько всего нужно подписать?'];
const DIRECTOR_FORECAST_QUESTIONS = ['Хватит ли денег до конца месяца?', 'Что сильнее всего повлияет на остаток?'];
const DIRECTOR_ACCOUNTING_QUESTIONS = ['Какие задачи у Ольги на этой неделе?', 'Что ещё требует моего решения?'];
const DIRECTOR_MONTH_QUESTIONS = ['Сколько заработали за месяц?', 'Как это соотносится с прошлым месяцем?'];
const DIRECTOR_DEBTORS_QUESTIONS = ['Сколько нам должны клиенты?', 'Есть ли просроченные счета?'];

const DIRECTOR_DIALOGS: DialogDef[] = [
  {
    id: 'director-signatures',
    title: 'Платежи, которые ждут подписи',
    source: 'платёжные поручения компании',
    keywords: /подпис|платеж|платёж|поручен|ждут/i,
    questions: DIRECTOR_APPROVAL_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>Сейчас на подписи <b>3 платежа на 452 000 ₽</b>. Все в пределах обычных сумм и подходят под договоры.</p>
          <Card title="Платежи на подпись" aside="сегодня">
            <Table head={['Получатель', 'Сумма']} rows={[
              { cells: ['Вектор, ООО', '202 000 ₽'] },
              { cells: ['Лаванда, ООО', '250 000 ₽'] },
              { cells: ['Связь и сервисы', 'до 50 000 ₽'] },
            ]} />
          </Card>
          <p>Показывать на главной только то, что ждёт вашего решения?</p>
          {isLast && <FollowUps items={['Добавить подписи на главную', 'Сколько всего платежей за месяц']} question={next} onAsk={ask} />}
        </>
      ),
      () => <p>Всего за месяц подготовлено 12 платежей на 2,6 млн ₽. 9 уже подписаны, ещё 3 ждут вас. Ольга подготовила их сегодня утром.</p>,
    ],
    offer: {
      text: 'Добавить на главную платежи, которые ждут вашей подписи? Покажу сумму и получателей.',
      widget: 'director-signatures',
      addedText: 'Готово. Показываю новые платежи, когда Ольга подготовит их к подписи.',
    },
  },
  {
    id: 'director-forecast',
    title: 'Хватит ли денег до конца месяца?',
    source: 'остатки по счетам, план платежей и зарплатная ведомость',
    keywords: /хватит|остат|денег|конца месяца|прогноз/i,
    questions: DIRECTOR_FORECAST_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>Да. Даже после зарплаты и налогов к концу месяца останется около <b>8,4 млн ₽</b>. Самая низкая точка — 4,8 млн ₽ 10 декабря.</p>
          <Card title="Прогноз остатка" aside="30 дней">
            <LineChart nowIndex={2} points={[
              { label: 'сейчас', value: 82 },
              { label: '10 дек', value: 28 },
              { label: '20 дек', value: 68 },
              { label: '30 дек', value: 52 },
            ]} />
          </Card>
          <Note>Учёл платежи на подписи, налоги и ведомость на 25 сотрудников</Note>
          <p>Следить за прогнозом и предупреждать, если денег станет мало?</p>
          {isLast && <FollowUps items={['Добавить прогноз на главную', 'Показать крупные платежи']} question={next} onAsk={ask} />}
        </>
      ),
      () => (
        <>
          <p>Больше всего на остаток повлияют зарплата 2,1 млн ₽ и налоговый платёж 640 000 ₽. Оба уже учтены, резерв не опустится ниже 4,8 млн ₽.</p>
          <Card title="Крупные списания до конца месяца">
            <Table head={['Дата', 'Платёж', 'Сумма']} rows={[
              { cells: ['10 декабря', 'Зарплата', '2,1 млн ₽'] },
              { cells: ['18 декабря', 'Налоги', '640 000 ₽'] },
              { cells: ['22 декабря', 'Аренда и сервисы', '380 000 ₽'] },
            ]} />
          </Card>
        </>
      ),
    ],
    offer: {
      text: 'Добавить прогноз остатка на главную? Буду пересчитывать его после платежей и поступлений.',
      widget: 'director-forecast',
      addedText: 'Готово. Пересчитываю прогноз каждый день и после крупных операций.',
    },
  },
  {
    id: 'director-accounting',
    title: 'Как идут дела у бухгалтерии?',
    source: 'задачи бухгалтера Ольги и календарь отчётности',
    keywords: /бухгалтер|ольг|отчет|отчёт|документ|задач/i,
    questions: DIRECTOR_ACCOUNTING_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>У Ольги всё по плану. Налоги и отчётность в срок, два акта сверки ждут контрагентов.</p>
          <Card title="Статус бухгалтерии">
            <Table head={['Задача', 'Статус', 'Срок']} rows={[
              { cells: ['Налоги', 'в срок', '18 декабря'] },
              { cells: ['Отчётность', 'в срок', '25 декабря'] },
              { cells: ['Акты сверки · 2', 'ждём ответ', 'до 12 декабря'] },
            ]} />
          </Card>
          <p>Показывать только задачи, где понадобится ваше решение?</p>
          {isLast && <FollowUps items={['Добавить статус бухгалтерии', 'Какие задачи просрочены']} question={next} onAsk={ask} />}
        </>
      ),
      () => <p>Сейчас от вас ничего не требуется. Если появится просрочка или документ на согласование, вынесу это наверх.</p>,
    ],
    offer: {
      text: 'Добавить на главную короткий статус бухгалтерии: налоги, отчётность и документы, которые ждут ответа?',
      widget: 'director-accounting',
      addedText: 'Готово. Показываю только исключения и ближайшие сроки.',
    },
  },
  {
    id: 'director-month',
    title: 'Итоги месяца',
    source: 'поступления, расходы и управленческий учёт за ноябрь',
    keywords: /итог|прибыл|заработ|месяц|динамик/i,
    questions: DIRECTOR_MONTH_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>Прогноз прибыли за ноябрь — <b>1,4 млн ₽</b>, это на 9% больше октября. Выручка выросла за счёт двух новых договоров.</p>
          <Card title="Итоги месяца" aside="ноябрь">
            <Table head={['Показатель', 'Ноябрь', 'К октябрю']} rows={[
              { cells: ['Выручка', '12,8 млн ₽', '+12%'] },
              { cells: ['Расходы', '11,4 млн ₽', '+8%'] },
              { cells: ['Прибыль', '1,4 млн ₽', '+9%'], isTotal: true },
            ]} />
          </Card>
          {isLast && <FollowUps items={['Добавить итоги месяца', 'Показать новые договоры']} question={next} onAsk={ask} />}
        </>
      ),
      () => <p>В октябре прибыль была 1,28 млн ₽. В ноябре рост дали договоры с «Вектором» и «Промснабом»; расходы на аренду и зарплату остались стабильными.</p>,
    ],
    offer: {
      text: 'Добавить итоги месяца на главную? Покажу прибыль и изменение к прошлому месяцу.',
      widget: 'director-month',
      addedText: 'Готово. Итоги обновятся после закрытия месяца и загрузки отчётов.',
    },
  },
  {
    id: 'director-debtors',
    title: 'Нам должны клиенты',
    source: 'выставленные счета и поступления за последние 90 дней',
    keywords: /долж|дебитор|клиент не оплат|просроч/i,
    questions: DIRECTOR_DEBTORS_QUESTIONS,
    answers: [
      ({ ask, isLast, next }) => (
        <>
          <p>Клиенты должны <b>3,2 млн ₽</b> по трём счетам. Просроченных пока нет — ближайшая дата оплаты 12 декабря.</p>
          <Card title="Ожидаемые поступления">
            <Table head={['Клиент', 'Сумма', 'Срок']} rows={[
              { cells: ['Вектор, ООО', '2,6 млн ₽', '12 декабря'] },
              { cells: ['Промснаб', '600 000 ₽', '18 декабря'] },
              { cells: ['Лаванда, ООО', 'до 50 000 ₽', '20 декабря'] },
            ]} />
          </Card>
          {isLast && <FollowUps items={['Показывать долги клиентов', 'Кто оплатит позже всех']} question={next} onAsk={ask} />}
        </>
      ),
      () => <p>Просрочек нет. Если срок оплаты пройдёт, отмечу счёт и предложу отправить напоминание.</p>,
    ],
    offer: {
      text: 'Показывать на главной, сколько должны клиенты и когда ждать оплату?',
      widget: 'director-debtors',
      addedText: 'Готово. Сумма обновляется после каждого поступления.',
    },
  },
];

const DIRECTOR_THREADS: AssistantThread[] = [
  { id: 'director-budget', title: 'Согласование бюджета на декабрь', status: 'working' },
  { id: 'director-contract', title: 'Новые условия договора с Вектором', status: 'unread' },
  { id: 'director-plan', title: 'План на следующий квартал', status: 'read' },
];

const directorThreadsWith = (ids: string[]): AssistantThread[] => [
  ...DIRECTOR_DIALOGS.filter((d) => ids.includes(d.id))
    .reverse()
    .map((d) => ({ id: d.id, title: d.title, status: 'read' as const })),
  ...DIRECTOR_THREADS,
];

const DIRECTOR: BusinessDef = {
  id: 'director',
  name: 'Сергей',
  threads: DIRECTOR_THREADS,
  dialogs: DIRECTOR_DIALOGS,
  proposals: [
    {
      id: 'director-forecast',
      text: 'Ольга подготовила платежи на подпись. Хотите видеть, сколько останется после крупных списаний?',
      widget: 'director-forecast',
      accept: 'Добавить прогноз',
      editIdeas: ['Показывай прогноз на 60 дней', 'Предупреждай, если остаток ниже 5 млн ₽'],
      isAvailable: (s) => s.pinned.includes('director-signatures'),
    },
    {
      id: 'director-accounting',
      text: 'Могу показывать, всё ли в порядке у Ольги: сроки отчётности, налоги и документы на согласовании.',
      widget: 'director-accounting',
      accept: 'Добавить статус',
      editIdeas: ['Показывай только просрочки', 'Напоминай за 3 дня до срока'],
      isAvailable: (s) => s.pinned.includes('director-forecast'),
    },
    {
      id: 'director-month',
      text: 'Могу подводить итоги месяца: прибыль, динамика к прошлому месяцу и главные изменения.',
      widget: 'director-month',
      accept: 'Добавить итоги',
      editIdeas: ['Сравнивай с планом', 'Показывай только ключевые отклонения'],
      isAvailable: (s) => s.pinned.includes('director-accounting'),
    },
    {
      id: 'director-debtors',
      text: 'По счетам ожидается 3,2 млн ₽. Следить за поступлениями и сообщить, если появится просрочка?',
      widget: 'director-debtors',
      accept: 'Добавить дебиторку',
      editIdeas: ['Показывай долги старше 10 дней', 'Учитывай только суммы от 100 000 ₽'],
      isAvailable: (s) => s.pinned.includes('director-month'),
    },
  ],
  homeLine: (s) => {
    if (s.pinned.includes('director-debtors')) return { text: 'Остаток закрыт: прогноз прибыли 1,4 млн ₽. Просроченных счетов и задач бухгалтерии нет.' };
    if (s.pinned.includes('director-forecast')) return { text: 'Всё спокойно. После зарплаты 10 декабря останется около 4,8 млн ₽.' };
    if (s.pinned.includes('director-signatures')) return { text: 'Ольга подготовила 3 платежа на 452 000 ₽ — все в пределах обычных сумм.' };
    return { text: 'Компания подключена. Пригласите бухгалтера — буду показывать только то, что требует вашего решения.' };
  },
  money: (s) => {
    if (s.pinned.includes('director-month')) return '8,2 млн ₽';
    if (s.pinned.includes('director-forecast')) return '7,1 млн ₽';
    if (s.pinned.includes('director-signatures')) return '6,2 млн ₽';
    return '0 ₽';
  },
  stages: [
    { label: 'День 1', state: () => initialState(DIRECTOR) },
    {
      label: '2 недели',
      state: () => ({
        ...initialState(DIRECTOR),
        threads: directorThreadsWith(['director-signatures']),
        pinned: ['director-signatures'],
        dialogs: { 'director-signatures': doneDialog(DIRECTOR_APPROVAL_QUESTIONS) },
      }),
    },
    {
      label: '2 месяца',
      state: () => ({
        ...initialState(DIRECTOR),
        threads: directorThreadsWith(['director-signatures', 'director-forecast', 'director-accounting']),
        pinned: ['director-signatures', 'director-forecast', 'director-accounting'],
        dialogs: {
          'director-signatures': doneDialog(DIRECTOR_APPROVAL_QUESTIONS),
          'director-forecast': doneDialog(DIRECTOR_FORECAST_QUESTIONS),
          'director-accounting': doneDialog(DIRECTOR_ACCOUNTING_QUESTIONS),
        },
      }),
    },
    {
      label: 'Полгода',
      state: () => ({
        ...initialState(DIRECTOR),
        threads: directorThreadsWith(['director-signatures', 'director-forecast', 'director-accounting', 'director-month', 'director-debtors']),
        pinned: ['director-signatures', 'director-month', 'director-forecast', 'director-debtors', 'director-accounting'],
        dialogs: {
          'director-signatures': doneDialog(DIRECTOR_APPROVAL_QUESTIONS),
          'director-forecast': doneDialog(DIRECTOR_FORECAST_QUESTIONS),
          'director-accounting': doneDialog(DIRECTOR_ACCOUNTING_QUESTIONS),
          'director-month': doneDialog(DIRECTOR_MONTH_QUESTIONS),
          'director-debtors': doneDialog(DIRECTOR_DEBTORS_QUESTIONS),
        },
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
  'market-payouts': 'Выплаты площадок',
  'market-profit': 'Прибыль по товарам',
  'market-holdbacks': 'Удержания площадок',
  'market-stock': 'Закупка к Новому году',
  'market-inventory': 'Остатки на складах',
  'market-ads': 'Реклама товаров',
  'director-signatures': 'Ждут вашей подписи',
  'director-forecast': 'Прогноз остатка',
  'director-accounting': 'Бухгалтерия',
  'director-month': 'Итоги месяца',
  'director-debtors': 'Нам должны',
};

const withEditDialogs = (def: BusinessDef): BusinessDef => ({
  ...def,
  dialogs: [...def.dialogs, ...def.proposals.map((p) => editDialog(p, WIDGET_TITLES[p.widget]))],
});

export const BUSINESSES: Record<BusinessId, BusinessDef> = {
  coffee: withEditDialogs(COFFEE),
  solo: withEditDialogs(SOLO),
  marketplace: withEditDialogs(MARKETPLACE),
  director: withEditDialogs(DIRECTOR),
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
  marketplace: initialState(MARKETPLACE),
  director: initialState(DIRECTOR),
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

