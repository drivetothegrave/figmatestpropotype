import React from 'react';
import { Avatar, Cell, CellRightAccessory, Chip, Widget } from '@pluginwoman/t-ds';
import { Plus } from '@pluginwoman/t-ds/icons';
import { HousePercent, Wallet } from '@pluginwoman/t-ds/icons/32/Filled';

/** Остаток по дням октября — для графика «Всего на счетах» (данные прототипа) */
const BALANCE = [
  3.33, 3.34, 3.32, 3.36, 3.35, 3.34, 3.37, 3.39, 3.38, 3.4, 3.41, 3.39, 3.42, 3.4, 3.39, 3.41, 3.43, 3.42, 3.4,
  3.41, 3.43, 3.44, 3.42, 3.41, 3.43, 3.44, 3.42,
];

const ACCOUNTS = [
  { title: 'Расчётный, **3486', amount: '22 785,37 ₽', avatar: <Avatar size={24} shape="circle" label="₽" /> },
  {
    title: 'Фонды · 5',
    amount: '422 785,37 ₽',
    avatar: <Avatar size={24} shape="circle" icon={<Wallet />} className="finance-widget__avatar finance-widget__avatar--fund" />,
  },
  {
    title: 'Депозиты · 2',
    amount: '500 000 ₽',
    avatar: <Avatar size={24} shape="circle" icon={<HousePercent />} className="finance-widget__avatar finance-widget__avatar--deposit" />,
  },
];

const PERIODS = ['Неделя', 'Месяц', 'Квартал', 'Год'];

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
  const [period, setPeriod] = React.useState('Месяц');
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
            <span className="ts-500-s finance-widget__delta">+ 22 785,37 ₽ за октябрь</span>
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
        <AreaChart values={BALANCE} />
        <div className="ts-400-xs finance-widget__axis">
          <span>1 Окт</span>
          <span>27 Окт</span>
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
        <div className="finance-widget__list">
          {ACCOUNTS.map((account) => (
            <Cell
              key={account.title}
              title={account.title}
              titleClassName="ts-500-s"
              verticalPadding="none"
              leftAccessory={account.avatar}
              rightAccessory={<CellRightAccessory variant="text-s" text={account.amount} />}
            />
          ))}
        </div>
        <button type="button" className="ts-500-s home-link hoverOpacity">
          Все счета · 3
        </button>
      </div>
    </Widget>
  );
};
