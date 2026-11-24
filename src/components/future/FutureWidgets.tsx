import React from 'react';
import { ContextMenu, Widget } from '@pluginwoman/t-ds';
import { DotsThreeHorizontal } from '@pluginwoman/t-ds/icons/24/Stroked';
import { AmountRow, DotItem, Total } from '../v2/homeWidgets';
import { FutureWidgetId } from '../../future';

/** Доли продуктов и зарплаты по точкам; выше нормы — оранжевым */
export const POINT_SHARES = [
  { point: 'Пятницкая', products: '28%', salary: '27%' },
  { point: 'Арбат', products: '37%', salary: '33%', isHigh: true },
];

const WIDGETS: Record<FutureWidgetId, { title: string; content: React.ReactNode }> = {
  revenue: {
    title: 'Выручка',
    content: (
      <>
        <Total caption="Сегодня, 16:23" amount="148 920 ₽" />
        <div className="home-widget-list">
          <AmountRow label="Эквайринг" amount="22 785,37 ₽" />
          <AmountRow label="СБП по QR" amount="722 785,37 ₽" />
        </div>
        <DotItem>2 терминала и касса</DotItem>
      </>
    ),
  },
  'products-salary': {
    title: 'Продукты и зарплата',
    content: (
      <>
        <Total caption="Доля от выручки · ноябрь" amount="31% · 29%" />
        <table className="future-table future-table--compact">
          <thead>
            <tr className="ts-400-xs">
              <th />
              <th>Продукты</th>
              <th>Зарплата</th>
            </tr>
          </thead>
          <tbody className="ts-400-s">
            {POINT_SHARES.map((row) => (
              <tr key={row.point} className={row.isHigh ? 'future-table__row--high' : ''}>
                <td>{row.point}</td>
                <td className="ts-500-s">{row.products}</td>
                <td className="ts-500-s">{row.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="ts-400-xs home-widget-secondary">Предупрежу, если продукты выше 33%</p>
      </>
    ),
  },
};

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
  /** proposed — ассистент только предлагает: пунктирная рамка и метка «Новый» */
  state: 'proposed' | 'pinned';
  onOpenThread?: () => void;
  onUnpin?: () => void;
}

export const FutureWidget: React.FC<FutureWidgetProps> = ({ id, state, onOpenThread, onUnpin }) => {
  const widget = WIDGETS[id];
  return (
    <div className={`future-widget future-widget--${state}`}>
      <Widget
        title={widget.title}
        hasChevron={false}
        hasDescription={false}
        rightAccessory={
          state === 'proposed' ? (
            <span className="future-tag ts-500-xs">Новый</span>
          ) : onUnpin ? (
            <WidgetMenu title={widget.title} onOpenThread={onOpenThread} onUnpin={onUnpin} />
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
