import React from 'react';
import { MONTHS_NOM, addDays, dayMonth, formatRub } from '../../data';
import { AreaChart } from '../AreaChart';
import { ChartBar, ChevronDown, LinesThreeHorizontal } from '@pluginwoman/t-ds/icons/32/Stroked';
import { Avatar, Badge, Button, Cell, CellRightAccessory, Chip, ContextualNotification, Widget } from '@pluginwoman/t-ds';
import { StarShineAcsStarShine } from '@pluginwoman/t-ds/icons/24/Filled';
import { Plus } from '@pluginwoman/t-ds/icons';
import russiaLogo from '../../assets/logos/Russia.svg';
import fundLogo from '../../assets/logos/Fund.svg';
import depositLogo from '../../assets/logos/Deposit.svg';
import cardPurple from '../../assets/cards/purple.svg';
import cardTeal from '../../assets/cards/teal.svg';

type Period = 'Неделя' | 'Месяц' | 'Квартал' | 'Год';

/** Подписи точек: `count` дат с шагом `step` дней, последняя — `lastIso` («27 октября») */
const daysBack = (lastIso: string, count: number, step: number) =>
  Array.from({ length: count }, (_, i) => dayMonth(addDays(lastIso, -(count - 1 - i) * step)));

/** Остаток в точке: млн ₽ → рубли с копейками; последняя точка — текущий остаток */
const balanceAt = (values: number[], i: number) =>
  i === values.length - 1 ? 3422785.37 : Math.round(values[i] * 1e6 + ((i * 7919 + 4321) % 9000)) + ((i * 37) % 100) / 100;

/** Остаток на счетах (млн ₽) по периодам, прирост и подписи краёв оси — данные прототипа */
const PERIOD_DATA: Record<Period, { values: number[]; dates: string[]; delta: string; from: string; to: string }> = {
  Неделя: {
    values: [3.4, 3.41, 3.39, 3.42, 3.41, 3.43, 3.42],
    dates: daysBack('2026-10-27', 7, 1),
    delta: '+ 4 120,00 ₽ за неделю',
    from: '21 Окт',
    to: '27 Окт',
  },
  Месяц: {
    values: [
      3.33, 3.34, 3.32, 3.36, 3.35, 3.34, 3.37, 3.39, 3.38, 3.4, 3.41, 3.39, 3.42, 3.4, 3.39, 3.41, 3.43, 3.42,
      3.4, 3.41, 3.43, 3.44, 3.42, 3.41, 3.43, 3.44, 3.42,
    ],
    dates: daysBack('2026-10-27', 27, 1),
    delta: '+ 22 785,37 ₽ за октябрь',
    from: '1 Окт',
    to: '27 Окт',
  },
  Квартал: {
    values: [3.1, 3.14, 3.12, 3.18, 3.22, 3.2, 3.26, 3.3, 3.28, 3.34, 3.38, 3.4, 3.42],
    dates: daysBack('2026-10-27', 13, 7),
    delta: '+ 312 400,00 ₽ за квартал',
    from: '1 Авг',
    to: '27 Окт',
  },
  Год: {
    values: [2.18, 2.3, 2.26, 2.45, 2.6, 2.55, 2.74, 2.9, 2.86, 3.05, 3.2, 3.32, 3.42],
    dates: MONTHS_NOM.slice(9).map((m) => `${m} 2025`).concat(MONTHS_NOM.slice(0, 10).map((m) => `${m} 2026`)),
    delta: '+ 1 240 000,00 ₽ за год',
    from: 'Окт 2025',
    to: 'Окт 2026',
  },
};

const PERIODS = Object.keys(PERIOD_DATA) as Period[];

// Логотипы счетов из макета (48×48, в кружке 24px)
const ACCOUNTS = [
  { title: 'Расчётный, **3486', amount: '22 785,37 ₽', logo: russiaLogo },
  { title: 'Фонды · 5', amount: '422 785,37 ₽', logo: fundLogo },
  { title: 'Депозиты · 2', amount: '500 000 ₽', logo: depositLogo },
];

// Карты: мини-изображение карты 39×24 и остаток
const CARDS = [
  { title: 'Карта для бизнеса, **3486', amount: '22 785,37 ₽', image: cardPurple },
  { title: 'Виртуальная, **8945', amount: '785,37 ₽', image: cardTeal },
];

/**
 * Режим «Счета списком» (макет «Счета списками»): каждый счёт, фонд и депозит — отдельной строкой
 * с подписью; данные прототипа
 */
const LIST_TABS: {
  id: 'accounts' | 'funds' | 'deposits';
  title: string;
  link: string;
  items: { title: string; subtitle: string; amount: string; logo: string }[];
}[] = [
  {
    id: 'accounts',
    title: 'Счета',
    link: 'Все счета · 3',
    items: [
      { title: 'Расчётный', subtitle: '**3486 · 2 карты', amount: '22 785,37 ₽', logo: russiaLogo },
      { title: 'Операционный', subtitle: '**8934 · 1 карта', amount: '2 374,77 ₽', logo: russiaLogo },
      { title: 'Резервный', subtitle: '**5521 · без карт', amount: '397 625,23 ₽', logo: russiaLogo },
    ],
  },
  {
    id: 'funds',
    title: 'Фонды',
    link: 'Все фонды · 5',
    items: [
      { title: 'На налоги', subtitle: 'Откладывает 6% с поступлений', amount: '312 400,00 ₽', logo: fundLogo },
      { title: 'Зарплата', subtitle: 'Пополнение 5-го числа', amount: '280 000,00 ₽', logo: fundLogo },
      { title: 'Резерв', subtitle: 'Цель — 500 000 ₽', amount: '130 385,37 ₽', logo: fundLogo },
    ],
  },
  {
    id: 'deposits',
    title: 'Депозиты',
    link: 'Все депозиты · 2',
    items: [
      { title: 'На 6 месяцев', subtitle: '16% годовых · до 12 марта', amount: '500 000,00 ₽', logo: depositLogo },
      { title: 'На год', subtitle: '15% годовых · до 3 октября', amount: '842 785,37 ₽', logo: depositLogo },
    ],
  },
];

/** Детализация остатков в режиме «Счета списком» — вместо графика */
const BALANCE_DETAILS = [
  { title: 'Счета', amount: '422 785,37 ₽' },
  { title: 'Фонды', amount: '722 785,37 ₽' },
  { title: 'Депозиты', amount: '1 342 785,37 ₽' },
];

type Tab = 'accounts' | 'funds' | 'deposits' | 'cards' | 'finance';

/** Виджет «Финансы»: всего на счетах с графиком и список счетов/карт */
interface FinanceWidgetProps {
  /** Промо-вкладка «Финансирование» с предложением кредита (настройка прототипа) */
  hasFinancePromo: boolean;
  /** Рекомендация открыть фонд под налоги внизу виджета (настройка прототипа) */
  hasFundRecommendation: boolean;
  /** Счета списком: каждый счёт отдельно, слева — график или детализация остатков (настройка прототипа) */
  isAccountsList: boolean;
}

export const FinanceWidget: React.FC<FinanceWidgetProps> = ({ hasFinancePromo, hasFundRecommendation, isAccountsList }) => {
  const [period, setPeriod] = React.useState<Period>('Месяц');
  const data = PERIOD_DATA[period];
  // В режиме «Счета списком» слева — график или детализация остатков
  const [leftView, setLeftView] = React.useState<'chart' | 'details'>('chart');
  const [tab, setTab] = React.useState<Tab>('accounts');
  // Вкладка пропала (выключили промо или режим списка) — возвращаемся к счетам
  React.useEffect(() => {
    if ((!hasFinancePromo && tab === 'finance') || (!isAccountsList && (tab === 'funds' || tab === 'deposits'))) {
      setTab('accounts');
    }
  }, [hasFinancePromo, isAccountsList, tab]);
  // Крестик скрывает рекомендацию; если её снова включить в настройках — показываем
  const [isRecommendationHidden, setIsRecommendationHidden] = React.useState(false);
  React.useEffect(() => {
    if (hasFundRecommendation) setIsRecommendationHidden(false);
  }, [hasFundRecommendation]);

  const tabs: { id: Tab; title: string }[] = isAccountsList
    ? [...LIST_TABS.map(({ id, title }) => ({ id, title })), { id: 'cards', title: 'Карты' }]
    : [
        { id: 'accounts', title: 'Счета' },
        { id: 'cards', title: 'Карты' },
      ];
  const listTab = isAccountsList ? LIST_TABS.find((t) => t.id === tab) : undefined;

  const chart = (
    <>
      {/* key — при смене периода график появляется заново с короткой анимацией */}
      <AreaChart
        key={period}
        values={data.values}
        labels={data.dates}
        formatValue={(i) => formatRub(balanceAt(data.values, i))}
      />
      <div className="ts-400-xs finance-widget__axis">
        <span>{data.from}</span>
        <span>{data.to}</span>
      </div>
    </>
  );

  return (
    <Widget
      title="Финансы"
      hasChevron={false}
      hasDescription={false}
      rightAccessoryVariant="icon"
      rightAccessoryIcon={<Plus />}
      minContentHeight={0}
      className="home-widget"
      contentClassName={['finance-widget', isAccountsList ? 'finance-widget--list' : ''].filter(Boolean).join(' ')}
    >
      <div className="finance-widget__main">
        <div className="finance-widget__total">
          <div className="finance-widget__head">
            <div className="finance-widget__sum">
              <span className="ts-400-s finance-widget__secondary">Всего на счетах</span>
              <span className="ts-600-3xl">3 422 785,37 ₽</span>
              <span className="ts-500-s finance-widget__delta">{isAccountsList ? `↑ ${data.delta.replace('+ ', '')}` : data.delta}</span>
            </div>
            {isAccountsList ? (
              // Переключатель вида слева: график или детализация остатков
              <div className="finance-view-toggle" role="group" aria-label="Вид остатков">
                <Chip
                  variant="tab"
                  leftAccessory="icon"
                  leftIcon={<ChartBar />}
                  isSelected={leftView === 'chart'}
                  onClick={() => setLeftView('chart')}
                  className="finance-view-toggle__chip"
                >
                  <span className="visually-hidden">График</span>
                </Chip>
                <Chip
                  variant="tab"
                  leftAccessory="icon"
                  leftIcon={<LinesThreeHorizontal />}
                  isSelected={leftView === 'details'}
                  onClick={() => setLeftView('details')}
                  className="finance-view-toggle__chip"
                >
                  <span className="visually-hidden">Детализация</span>
                </Chip>
              </div>
            ) : (
              <Chip
                variant="dropdown"
                className="finance-period"
                value={period}
                popupContent={PERIODS.map((p) => (
                  <Cell key={p} title={p} verticalPadding="2x" onClick={() => setPeriod(p)} />
                ))}
              >
                {period}
                {/* Шеврон как у кнопки «Ещё»: из набора 32px в размере 20px */}
                <span className="ds-icon finance-period__chevron" aria-hidden="true">
                  <ChevronDown />
                </span>
              </Chip>
            )}
          </div>
          {isAccountsList && leftView === 'details' ? (
            <div className="finance-widget__details">
              {BALANCE_DETAILS.map((row) => (
                <Cell
                  key={row.title}
                  title={row.title}
                  titleClassName="ts-400-s"
                  verticalPadding="none"
                  rightAccessory={<CellRightAccessory variant="text-s" text={row.amount} />}
                />
              ))}
            </div>
          ) : (
            chart
          )}
        </div>

        <div className="finance-widget__divider" />

        <div className="finance-widget__accounts">
          <div className="finance-widget__tabs">
            {tabs.map((t) => (
              <Chip key={t.id} variant="tab" isSelected={tab === t.id} onClick={() => setTab(t.id)}>
                {t.title}
              </Chip>
            ))}
            {hasFinancePromo && (
              <Chip variant="tab" isSelected={tab === 'finance'} onClick={() => setTab('finance')} className="finance-promo-chip">
                Финансирование
                {/* Бейдж t-ds у чипа серый — для промо нужен фиолетовый, как в макете */}
                <Badge value={1} size="s" color="var(--bg-brand)" textColor="var(--primitive-default)" />
              </Chip>
            )}
          </div>
          {tab === 'finance' ? (
            // Предложение кредита — экрана в макете нет, вариант прототипа
            <div className="finance-offer">
              <div className="finance-offer__text">
                <span className="ts-500-m">Кредит до 5 000 000 ₽ одобрен заранее</span>
                <span className="ts-400-s finance-widget__secondary">Без залога, от 19% годовых. Деньги на счёт за 1 минуту</span>
              </div>
              <Button variant="primary" size="s" isHugWidth>
                Получить деньги
              </Button>
            </div>
          ) : listTab ? (
            <>
              <div className="finance-widget__list finance-widget__list--detailed">
                {listTab.items.map((item) => (
                  <Cell
                    key={item.title}
                    title={item.title}
                    titleClassName="ts-500-s"
                    description={item.subtitle}
                    descriptionClassName="ts-400-s"
                    verticalPadding="none"
                    leftAccessory={<Avatar size={32} shape="circle" imageUrl={item.logo} label={item.title} />}
                    rightAccessory={<CellRightAccessory variant="text-m" text={item.amount} />}
                  />
                ))}
              </div>
              <button type="button" className="ts-500-s home-link hoverOpacity">
                {listTab.link}
              </button>
            </>
          ) : tab === 'accounts' ? (
            <>
              <div className="finance-widget__list">
                {ACCOUNTS.map((account) => (
                  <Cell
                    key={account.title}
                    title={account.title}
                    titleClassName="ts-500-s"
                    verticalPadding="none"
                    leftAccessory={<Avatar size={24} shape="circle" imageUrl={account.logo} label={account.title} />}
                    rightAccessory={<CellRightAccessory variant="text-s" text={account.amount} />}
                  />
                ))}
              </div>
              <button type="button" className="ts-500-s home-link hoverOpacity">
                Все счета · 3
              </button>
            </>
          ) : (
            <div className="finance-widget__list">
              {CARDS.map((card) => (
                <Cell
                  key={card.title}
                  title={card.title}
                  titleClassName="ts-500-s"
                  verticalPadding="none"
                  leftAccessory={<img src={card.image} alt="" className="finance-widget__card" />}
                  rightAccessory={<CellRightAccessory variant="text-s" text={card.amount} />}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {hasFundRecommendation && !isRecommendationHidden && (
        <ContextualNotification
          className="insight-notice insight-notice--brand finance-recommendation"
          hasTitle={false}
          accessory="icon"
          icon={<StarShineAcsStarShine />}
          text={
            <>
              Чтобы налоги не застали врасплох — откройте фонд, он сам отложит 6% с поступлений.{' '}
              <button type="button" className="ts-500-s home-link">
                Открыть фонд
              </button>
            </>
          }
          onClose={() => setIsRecommendationHidden(true)}
        />
      )}
    </Widget>
  );
};
