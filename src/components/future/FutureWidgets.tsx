import React from 'react';
import { Button, ContextMenu, LinearProgress, Widget } from '@pluginwoman/t-ds';
import { DotsThreeHorizontal } from '@pluginwoman/t-ds/icons/24/Stroked';
import { DotItem, Total } from '../v2/homeWidgets';
import { FutureWidgetId } from '../../future';
import { LineChart } from './answerParts';

/** Строка «название — сумма» 18px; точка слева — статус, tone — цвет суммы */
const Row: React.FC<{ label: string; value: string; dot?: string; tone?: 'success' | 'error' }> = ({ label, value, dot, tone }) => (
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
  'market-payouts': {
    title: 'Выплаты площадок',
    size: 's',
    content: (
      <>
        <Total caption="Следующая выплата · 12 ноября" amount="412 300 ₽" />
        <Rows>
          <Row label="Ozon · 12 ноя" value="412 300 ₽" />
          <Row label="Wildberries · 14 ноя" value="286 900 ₽" />
        </Rows>
        <DotItem>Обновляю после отчёта площадки</DotItem>
      </>
    ),
  },
  'market-profit': {
    title: 'Прибыль по товарам',
    size: 's',
    content: (
      <>
        <Total caption="После комиссии и логистики" amount="612 000 ₽" />
        <Rows>
          <Row label="Складные стулья" value="+148 000 ₽" tone="success" />
          <Row label="Набор контейнеров" value="+96 000 ₽" tone="success" />
          <Row label="Подставка бамбук" value="−18 400 ₽" tone="error" />
        </Rows>
      </>
    ),
  },
  'market-holdbacks': {
    title: 'Удержания площадок',
    size: 's',
    content: (
      <>
        <Total caption="Октябрь · 38% от продаж" amount="1,02 млн ₽" />
        <Rows>
          <Row label="Комиссия" value="459 000 ₽" />
          <Row label="Логистика" value="357 000 ₽" />
          <Row label="Реклама" value="204 000 ₽" />
        </Rows>
      </>
    ),
  },
  'market-stock': {
    title: 'Закупка к НГ',
    size: 's',
    content: (
      <>
        <Total caption="По прогнозу продаж" amount="1,8 млн ₽" />
        <Rows>
          <Row label="Бюджет закупки" value="1,3 млн ₽" />
          <Row label="На счёте сейчас" value="1,1 млн ₽" />
          <Row label="Не хватает" value="200 000 ₽" />
        </Rows>
      </>
    ),
  },
  'market-inventory': {
    title: 'Остатки на складах',
    size: 's',
    content: (
      <>
        <Total caption="Хватит примерно на" amount="9 дней" />
        <Rows>
          <Row label="Склад Ozon" value="124 шт." dot="var(--primitive-success)" />
          <Row label="Склад WB" value="86 шт." dot="var(--primitive-warning)" />
          <Row label="В пути" value="240 шт." dot="var(--primitive-neutral-3)" />
        </Rows>
        <LinearProgress
          variant="percent"
          value={38}
          progressColor="var(--primitive-brand)"
          trackColor="var(--translucent-primitives-neutral-1)"
          ariaLabel="Запас товара на складах: 9 дней"
        />
      </>
    ),
  },
  'market-ads': {
    title: 'Реклама товаров',
    size: 's',
    content: (
      <>
        <Total caption="Октябрь · расходы" amount="204 000 ₽" />
        <Rows>
          <Row label="Продажи с рекламы" value="786 000 ₽" tone="success" />
          <Row label="ДРР" value="26%" />
          <Row label="Цель" value="до 20%" />
        </Rows>
      </>
    ),
  },
  'director-signatures': {
    title: 'Ждут вашей подписи',
    size: 's',
    content: (
      <>
        <Total caption="Платежи · 3" amount="−452 000 ₽" />
        <Rows>
          <Row label="Вектор, ООО" value="202 000 ₽" />
          <Row label="Лаванда, ООО" value="250 000 ₽" />
        </Rows>
        <Button variant="secondary" size="xs" isHugWidth>Подписать все</Button>
      </>
    ),
  },
  'director-forecast': {
    title: 'Прогноз остатка',
    size: 's',
    content: (
      <>
        <Total caption="Через 20 дней, если всё пойдёт как сейчас" amount="8,4 млн ₽" />
        <div className="future-forecast-chart">
          <LineChart nowIndex={2} points={[
            { label: 'сейчас', value: 82 },
            { label: '10 дек', value: 28 },
            { label: '20 дек', value: 68 },
            { label: '30 дек', value: 52 },
          ]} />
        </div>
        <DotItem>Самая низкая точка · 10 дек · 4,8 млн ₽</DotItem>
      </>
    ),
  },
  'director-accounting': {
    title: 'Бухгалтерия',
    size: 's',
    content: (
      <>
        <Rows>
          <Row label="Налоги" value="в срок" dot="var(--primitive-success)" />
          <Row label="Отчётность" value="в срок" dot="var(--primitive-success)" />
          <Row label="Документы" value="2 акта ждут" dot="var(--primitive-warning)" />
        </Rows>
        <DotItem>Последнее обновление · сегодня</DotItem>
      </>
    ),
  },
  'director-month': {
    title: 'Итоги месяца',
    size: 's',
    content: (
      <>
        <Total caption="Прогноз прибыли · ноябрь" amount="1,4 млн ₽" />
        <div className="future-month-bars" aria-hidden="true">
          {[42, 68, 50, 76, 58, 92].map((height, i) => <span key={i} className={i === 5 ? 'is-current' : ''} style={{ height: `${height}%` }} />)}
        </div>
        <Rows>
          <Row label="К прошлому месяцу" value="+9%" tone="success" />
        </Rows>
      </>
    ),
  },
  'director-debtors': {
    title: 'Нам должны',
    size: 's',
    content: (
      <>
        <Total caption="3 клиента" amount="3,2 млн ₽" />
        <Rows>
          <Row label="Вектор, ООО" value="2,6 млн ₽" dot="var(--primitive-success)" />
          <Row label="Промснаб" value="600 000 ₽" dot="var(--primitive-warning)" />
        </Rows>
        <DotItem>Просроченных счетов нет</DotItem>
      </>
    ),
  },
};

export const widgetTitle = (id: FutureWidgetId) => WIDGETS[id].title;

/** Меню «⋯» закреплённого виджета: изменить — в ветке чата с ассистентом, или скрыть с главной */
const WidgetMenu: React.FC<{ title: string; onEdit: () => void; onHide: () => void }> = ({ title, onEdit, onHide }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <ContextMenu
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="future-widget__menu"
      items={[
        { key: 'edit', label: 'Изменить', onClick: onEdit },
        { key: 'hide', label: 'Скрыть', onClick: onHide },
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
   * proposed — ассистент предлагает на главной: пунктирная рамка и «Новый»;
   * preview — показан в разговоре до добавления; pinned — на главной, с меню «⋯»
   */
  state: 'proposed' | 'preview' | 'pinned';
  onEdit?: () => void;
  onHide?: () => void;
}

export const FutureWidget: React.FC<FutureWidgetProps> = ({ id, state, onEdit, onHide }) => {
  const widget = WIDGETS[id];
  return (
    <div className={['future-widget', `future-widget--${state}`, `future-widget--${widget.size}`].join(' ')}>
      <Widget
        title={widget.title}
        hasChevron={false}
        hasDescription={false}
        rightAccessory={
          state === 'proposed' ? (
            <span className="future-tag ts-500-xs">Новый</span>
          ) : state === 'pinned' && onEdit && onHide ? (
            <WidgetMenu title={widget.title} onEdit={onEdit} onHide={onHide} />
          ) : (
            <span className="ds-icon ds-icon--m home-widget-more" aria-hidden="true">
              <DotsThreeHorizontal />
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
