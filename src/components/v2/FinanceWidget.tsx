import React from 'react';
import { MONTHS_NOM, addDays, dayMonth, formatRub } from '../../data';
import { AreaChart } from '../AreaChart';
import { ChevronDown } from '@pluginwoman/t-ds/icons/32/Stroked';
import { Avatar, Cell, CellRightAccessory, Chip, Widget } from '@pluginwoman/t-ds';
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
        </div>
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
