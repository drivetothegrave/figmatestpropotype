import React from 'react';
import { ContextMenu, LinearProgress, Widget } from '@pluginwoman/t-ds';
import { DotsThreeHorizontal } from '@pluginwoman/t-ds/icons/24/Stroked';
import { DotItem, Total } from '../v2/homeWidgets';
import { FutureWidgetId } from '../../future';

/** Строка «название — сумма» 18px; точка слева — статус, tone — цвет суммы */
const Row: React.FC<{ label: string; value: string; dot?: string; tone?: 'success' }> = ({ label, value, dot, tone }) => (
  <div className="future-row">
    {dot && <i className="future-row__dot" style={{ background: dot }} />}
    <span className="ts-400-s future-row__label">{label}</span>
    <span className={['ts-500-s', tone ? `future-row__value--${tone}` : ''].filter(Boolean).join(' ')}>{value}</span>
  </div>
);

const Rows: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="home-widget-list">{children}</div>;

/** Доли продуктов и зарплаты по точкам */
const POINT_SHARES = [
  { point: 'Пятницкая', products: '28%', salary: '27%' },
  { point: 'Арбат', products: '37%', salary: '33%' },
];

/** Клиенты за год — столбики по убыванию, первый — фирменным цветом */
const CLIENT_BARS = [100, 62, 40, 30, 18, 12];

/** s — полширины (2 в ряд), l — на всю ширину. Все одной высоты: ряд выравнивается по самому высокому */
const WIDGETS: Record<FutureWidgetId, { title: string; size: 's' | 'l'; content: React.ReactNode }> = {
  revenue: {
    title: 'Выручка',
    size: 's',
    content: (
      <>
        <Total caption="Сегодня, 16:23" amount="148 920 ₽" />
        <Rows>
          <Row label="Эквайринг" value="22 785,37 ₽" />
          <Row label="СБП по QR" value="722 785,37 ₽" />
        </Rows>
        <DotItem>2 терминала и касса</DotItem>
      </>
    ),
  },
  'products-salary': {
    title: 'Продукты и зарплата',
    size: 's',
    content: (
      <>
        <Total caption="Доля от выручки · Ноябрь" amount="31% · 29%" />
        {/* Подписи колонок висят над первой строкой и высоту не добавляют */}
        <div className="home-widget-list future-shares">
          <div className="future-shares__head ts-500-xxs" aria-hidden="true">
            <span>Продукты</span>
            <span>Зарплата</span>
          </div>
          {POINT_SHARES.map((row) => (
            <div key={row.point} className="future-shares__row">
              <span className="ts-400-s">{row.point}</span>
              <span className="ts-500-s">{row.products}</span>
              <span className="ts-500-s">{row.salary}</span>
            </div>
          ))}
        </div>
        <p className="ts-400-s home-widget-secondary">Предупрежу, если продукты выше 33%</p>
      </>
    ),
  },
  withdraw: {
    title: 'Можно вывести себе',
    size: 's',
    content: (
      <>
        <Total caption="Сегодня" amount="186 400 ₽" />
        <Rows>
          <Row label="На счёте" value="240 000 ₽" />
          <Row label="Отложить на налог 6%" value="−14 400 ₽" />
          <Row label="Резерв на месяц" value="−39 200 ₽" />
        </Rows>
      </>
    ),
  },
  debtors: {
    title: 'Мне должны',
    size: 's',
    content: (
      <>
        <Total caption="3 счёта" amount="145 000 ₽" />
        <Rows>
          <Row label="ООО «Пиксель»" value="60 000 ₽" dot="var(--primitive-success)" />
          <Row label="Кафе «Лето»" value="55 000 ₽" dot="var(--primitive-warning)" />
          <Row label="Иванов А." value="30 000 ₽" dot="var(--primitive-error)" />
        </Rows>
      </>
    ),
  },
  taxes: {
    title: 'Налоги',
    size: 's',
    content: (
      <>
        <Total caption="УСН 6% за 2026 · начислено" amount="86 100 ₽" />
        <Rows>
          <Row label="Уже заплатили" value="64 600 ₽" />
          <Row label="Отложено в фонде" value="21 500 ₽" tone="success" />
        </Rows>
        <LinearProgress
          variant="percent"
          value={100}
          progressColor="var(--primitive-success)"
          trackColor="var(--translucent-primitives-neutral-1)"
          ariaLabel="Налог за 2026 закрыт: заплачено и отложено"
        />
      </>
    ),
  },
  clients: {
    title: 'Клиенты за год',
    size: 's',
    content: (
      <>
        <span className="ts-400-s home-widget-secondary">Принесли больше всего</span>
        <div className="future-client-bars" aria-hidden="true">
          {CLIENT_BARS.map((h, i) => (
            <span key={i} className={i === 0 ? 'is-top' : ''} style={{ height: `${h}%` }} />
          ))}
        </div>
        <Rows>
          <Row label="ООО «Пиксель»" value="420 000 ₽" />
          <Row label="Кафе «Лето»" value="260 000 ₽" />
        </Rows>
      </>
    ),
  },
  'self-transfer': {
    title: 'Перевод себе',
    size: 'l',
    content: (
      <>
        <Total caption="Каждую пятницу · правило" amount="≈ 46 000 ₽" />
        <Rows>
          <Row label="Следующий" value="28 ноября" />
          <Row label="Прошлый" value="21 ноября · 44 200 ₽" />
          <Row label="Считаю" value="за вычетом налога и резерва" />
        </Rows>
      </>
    ),
  },
};

export const widgetTitle = (id: FutureWidgetId) => WIDGETS[id].title;

/** Меню «⋯» закреплённого виджета: вернуться в разговор, где его собрали, или убрать с главной */
const WidgetMenu: React.FC<{ title: string; onOpenThread?: () => void; onUnpin: () => void }> = ({
  title,
  onOpenThread,
  onUnpin,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <ContextMenu
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="future-widget__menu"
      items={[
        ...(onOpenThread ? [{ key: 'thread', label: 'Открыть разговор', onClick: onOpenThread }] : []),
        { key: 'unpin', label: 'Убрать с главной', onClick: onUnpin },
      ]}
      trigger={
        <button
          type="button"
          className="future-widget__more hoverOpacity"
          aria-label={`Действия: ${title}`}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className="ds-icon ds-icon--m" aria-hidden="true">
            <DotsThreeHorizontal />
          </span>
        </button>
      }
    />
  );
};

interface FutureWidgetProps {
  id: FutureWidgetId;
  /**
   * proposed — ассистент только предлагает: пунктирная рамка и «Новый»;
   * fresh — только что закреплён: фиолетовая рамка и «Новый»; pinned — обычный
   */
  state: 'proposed' | 'fresh' | 'pinned';
  onOpenThread?: () => void;
  onUnpin?: () => void;
  className?: string;
}

export const FutureWidget: React.FC<FutureWidgetProps> = ({ id, state, onOpenThread, onUnpin, className = '' }) => {
  const widget = WIDGETS[id];
  const menu = onUnpin ? (
    <WidgetMenu title={widget.title} onOpenThread={onOpenThread} onUnpin={onUnpin} />
  ) : (
    <span className="ds-icon ds-icon--m home-widget-more" aria-hidden="true">
      <DotsThreeHorizontal />
    </span>
  );
  return (
    <div className={['future-widget', `future-widget--${state}`, `future-widget--${widget.size}`, className].filter(Boolean).join(' ')}>
      <Widget
        title={widget.title}
        hasChevron={false}
        hasDescription={false}
        rightAccessory={
          state === 'pinned' ? (
            menu
          ) : (
            <span className="future-widget__accessory">
              <span className="future-tag ts-500-xs">Новый</span>
              {state === 'fresh' && menu}
            </span>
          )
        }
        minContentHeight={0}
        className="home-widget home-widget--small-title"
        contentClassName="home-widget__content"
      >
        {widget.content}
      </Widget>
    </div>
  );
};
