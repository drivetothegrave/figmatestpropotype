import React from 'react';
import { Avatar, Cell, CellRightAccessory, Chip, Widget } from '@pluginwoman/t-ds';
import { Plus } from '@pluginwoman/t-ds/icons';
import russiaLogo from '../../assets/logos/Russia.svg';
import fundLogo from '../../assets/logos/Fund.svg';
import depositLogo from '../../assets/logos/Deposit.svg';
import cardPurple from '../../assets/cards/purple.svg';
import cardTeal from '../../assets/cards/teal.svg';

type Period = 'Неделя' | 'Месяц' | 'Квартал' | 'Год';

/** Остаток на счетах (млн ₽) по периодам, прирост и подписи краёв оси — данные прототипа */
const PERIOD_DATA: Record<Period, { values: number[]; delta: string; from: string; to: string }> = {
  Неделя: {
    values: [3.4, 3.41, 3.39, 3.42, 3.41, 3.43, 3.42],
    delta: '+ 4 120,00 ₽ за неделю',
    from: '21 Окт',
    to: '27 Окт',
  },
  Месяц: {
    values: [
      3.33, 3.34, 3.32, 3.36, 3.35, 3.34, 3.37, 3.39, 3.38, 3.4, 3.41, 3.39, 3.42, 3.4, 3.39, 3.41, 3.43, 3.42,
      3.4, 3.41, 3.43, 3.44, 3.42, 3.41, 3.43, 3.44, 3.42,
    ],
    delta: '+ 22 785,37 ₽ за октябрь',
    from: '1 Окт',
    to: '27 Окт',
  },
  Квартал: {
    values: [3.1, 3.14, 3.12, 3.18, 3.22, 3.2, 3.26, 3.3, 3.28, 3.34, 3.38, 3.4, 3.42],
    delta: '+ 312 400,00 ₽ за квартал',
    from: '1 Авг',
    to: '27 Окт',
  },
  Год: {
    values: [2.18, 2.3, 2.26, 2.45, 2.6, 2.55, 2.74, 2.9, 2.86, 3.05, 3.2, 3.32, 3.42],
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

/** Площадной график остатка: линия + заливка, растягивается по ширине */
const AreaChart: React.FC<{ values: number[] }> = ({ values }) => {
  const width = 400;
  const height = 93;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * width,
    height - ((v - min) / (max - min || 1)) * (height - 8) - 4,
  ]);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg className="finance-widget__chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="finance-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" className="finance-widget__area-stop finance-widget__area-stop--top" />
          <stop offset="100%" className="finance-widget__area-stop" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width},${height} L0,${height} Z`} fill="url(#finance-area)" />
      <path d={line} className="finance-widget__line" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

/** Виджет «Финансы»: всего на счетах с графиком и список счетов/карт */
export const FinanceWidget: React.FC = () => {
  const [period, setPeriod] = React.useState<Period>('Месяц');
  const data = PERIOD_DATA[period];
  const [tab, setTab] = React.useState<'accounts' | 'cards'>('accounts');

  return (
    <Widget
      title="Финансы"
      hasChevron={false}
      hasDescription={false}
      rightAccessoryVariant="icon"
      rightAccessoryIcon={<Plus />}
      minContentHeight={0}
      className="home-widget"
      contentClassName="finance-widget"
    >
      <div className="finance-widget__total">
        <div className="finance-widget__head">
          <div className="finance-widget__sum">
            <span className="ts-400-s finance-widget__secondary">Всего на счетах</span>
            <span className="ts-600-3xl">3 422 785,37 ₽</span>
            <span className="ts-500-s finance-widget__delta">{data.delta}</span>
          </div>
          <Chip
            variant="dropdown"
            value={period}
            popupContent={PERIODS.map((p) => (
              <Cell key={p} title={p} verticalPadding="2x" onClick={() => setPeriod(p)} />
            ))}
          >
            {period}
          </Chip>
        </div>
        {/* key — при смене периода график появляется заново с короткой анимацией */}
        <AreaChart key={period} values={data.values} />
        <div className="ts-400-xs finance-widget__axis">
          <span>{data.from}</span>
          <span>{data.to}</span>
        </div>
      </div>

      <div className="finance-widget__divider" />

      <div className="finance-widget__accounts">
        <div className="finance-widget__tabs">
          <Chip variant="tab" isSelected={tab === 'accounts'} onClick={() => setTab('accounts')}>
            Счета
          </Chip>
          <Chip variant="tab" isSelected={tab === 'cards'} onClick={() => setTab('cards')}>
            Карты
          </Chip>
        </div>
        {tab === 'accounts' ? (
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
    </Widget>
  );
};
