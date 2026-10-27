import React from 'react';
import { Button, Cell, CellRightAccessory, LinearProgress } from '@pluginwoman/t-ds';

/** Виджеты главной, которые можно добавить, скрыть и переставить (экран «Настройка виджетов») */
export type HomeWidgetId = 'revenue' | 'forecast' | 'limits' | 'taxes' | 'risks';

export interface HomeWidgetDef {
  id: HomeWidgetId;
  title: string;
  /** l — полширины (2 в ряд), s — треть (3 в ряд) */
  size: 'l' | 's';
  content: React.ReactNode;
}

/** Строка «название — сумма» */
const AmountRow: React.FC<{ label: string; amount: string }> = ({ label, amount }) => (
  <Cell
    title={label}
    titleClassName="ts-400-s"
    verticalPadding="none"
    rightAccessory={<CellRightAccessory variant="text-s" text={amount} />}
  />
);

/** Пункт с зелёной точкой */
const DotItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="ts-400-s home-widget-dot">{children}</p>
);

/** Крупная сумма с подписью сверху */
const Total: React.FC<{ caption: string; amount: string }> = ({ caption, amount }) => (
  <div className="home-widget-total">
    <span className="ts-400-s home-widget-secondary">{caption}</span>
    <span className="ts-500-xl">{amount}</span>
  </div>
);

/** Прогноз: факт — сплошной линией, прогноз — пунктиром, «сегодня» — вертикаль посередине */
const ForecastChart: React.FC = () => (
  <svg className="forecast-chart" viewBox="0 0 400 74" preserveAspectRatio="none" aria-hidden="true">
    <line x1="200" y1="0" x2="200" y2="74" className="forecast-chart__today" vectorEffect="non-scaling-stroke" />
    <polyline points="0,38 80,34 130,44 200,30" className="forecast-chart__line" vectorEffect="non-scaling-stroke" />
    <polyline
      points="200,30 250,50 320,36 400,40"
      className="forecast-chart__line forecast-chart__line--forecast"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const LIMITS = [
  { label: 'Перевести физлицам', amount: '400 000 ₽', value: 70, color: 'var(--primitive-success)' },
  { label: 'Снять наличных', amount: '50 000 ₽', value: 20, color: 'var(--primitive-warning)' },
  { label: 'Пополнить счёт', amount: '100 000 ₽', value: 90, color: 'var(--primitive-success)' },
];

export const HOME_WIDGETS: HomeWidgetDef[] = [
  {
    id: 'revenue',
    title: 'Выручка',
    size: 'l',
    content: (
      <>
        <Total caption="Сегодня, 16:23" amount="148 920 ₽" />
        <div className="home-widget-list">
          <AmountRow label="Эквайринг" amount="22 785,37 ₽" />
          <AmountRow label="СБП по QR" amount="722 785,37 ₽" />
          <AmountRow label="OZON" amount="722 785,37 ₽" />
        </div>
        <DotItem>2 терминала и касса</DotItem>
      </>
    ),
  },
  {
    id: 'forecast',
    title: 'Прогноз остатка',
    size: 'l',
    content: (
      <>
        <Total caption="Остаток через 30 дней, если всё пойдет как обычно" amount="3 422 785,37 ₽" />
        <ForecastChart />
        <p className="ts-400-s">Самая низкая точка — 10 октября, после зарплаты 22 785 ₽</p>
      </>
    ),
  },
  {
    id: 'limits',
    title: 'Лимиты',
    size: 's',
    content: (
      <div className="home-widget-limits">
        <p className="ts-500-m">Осталось в сентябре</p>
        {LIMITS.map((limit) => (
          <div key={limit.label} className="home-widget-limit">
            <div className="home-widget-limit__text">
              <span className="ts-400-s home-widget-secondary">{limit.label}</span>
              <span className="ts-500-m">{limit.amount}</span>
            </div>
            <LinearProgress
              variant="percent"
              value={limit.value}
              progressColor={limit.color}
              trackColor="var(--translucent-primitives-neutral-1)"
              ariaLabel={`${limit.label}: использовано ${limit.value}%`}
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'taxes',
    title: 'Налоги',
    size: 's',
    content: (
      <>
        <Total caption="УСН 6% за 2026 · начислено" amount="14 785,37 ₽" />
        <div className="home-widget-list">
          <AmountRow label="Уже заплатили" amount="22 785,37 ₽" />
          <AmountRow label="Осталось" amount="722 785,37 ₽" />
        </div>
        <Button variant="secondary" size="s" isHugWidth>
          Заплатить
        </Button>
      </>
    ),
  },
  {
    id: 'risks',
    title: 'Риски бизнеса',
    size: 's',
    content: (
      <>
        <div className="home-widget-risk">
          <p className="ts-500-m">Низкий риск по операциям</p>
          <LinearProgress
            variant="steps"
            value={1}
            maxSteps={3}
            progressColor="var(--primitive-success)"
            trackColor="var(--translucent-primitives-neutral-1)"
          />
        </div>
        <div className="home-widget-list">
          <DotItem>Контрагенты</DotItem>
          <DotItem>Требования ФНС</DotItem>
          <DotItem>Арбитражные дела</DotItem>
        </div>
        <p className="ts-400-s home-widget-secondary">Сегодня, 16:23</p>
      </>
    ),
  },
];

/** По умолчанию на главной только «Финансы» и «История» */
export const DEFAULT_HOME_WIDGETS: HomeWidgetId[] = [];

export const widgetById = (id: HomeWidgetId) => HOME_WIDGETS.find((w) => w.id === id)!;
