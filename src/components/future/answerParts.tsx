import React from 'react';
import { Chip } from '@pluginwoman/t-ds';
import { InformationCircle } from '@pluginwoman/t-ds/icons/20/Stroked';

/** Кусочки ответов ассистента: карточки, таблицы, сегменты, графики, сноски, подсказки */

/** Сноска мелким шрифтом: откуда цифры */
export const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="future-note ts-400-xs">
    <span className="ds-icon future-note__icon" aria-hidden="true">
      <InformationCircle />
    </span>
    {children}
  </p>
);

/** Подсказки следующего шага. Первый чип задаёт следующий вопрос сценария, остальные — для вида */
export const FollowUps: React.FC<{ items: string[]; question?: string; onAsk?: (q: string) => void }> = ({
  items,
  question,
  onAsk,
}) => (
  <div className="future-followups">
    {items.map((item, i) => (
      <Chip key={item} variant="chip" onClick={i === 0 && question && onAsk ? () => onAsk(question) : undefined}>
        {item}
      </Chip>
    ))}
  </div>
);

export const Card: React.FC<{ title?: string; aside?: string; children: React.ReactNode }> = ({ title, aside, children }) => (
  <div className="future-card">
    {title && (
      <div className="future-card__title">
        <span className="ts-500-l">{title}</span>
        {aside && <span className="ts-400-s home-widget-secondary">{aside}</span>}
      </div>
    )}
    {children}
  </div>
);

export interface Segment {
  label: string;
  amount: string;
  /** Доля — относительный вес сегмента */
  share: number;
  color: string;
}

/** Полоса из сегментов с легендой — «куда уходят деньги» */
export const SegmentedBar: React.FC<{ segments: Segment[] }> = ({ segments }) => (
  <>
    <div className="future-segments" aria-hidden="true">
      {segments.map((s) => (
        <span key={s.label} style={{ flexGrow: s.share, background: s.color }} />
      ))}
    </div>
    <div className="future-legend ts-400-xs">
      {segments.map((s) => (
        <span key={s.label}>
          <i style={{ background: s.color }} />
          {s.label} — {s.amount}
        </span>
      ))}
    </div>
  </>
);

/** Таблица ответа: первая колонка — подписи, остальные — по правому краю; high — значения выше нормы */
export const Table: React.FC<{ head: string[]; rows: { cells: string[]; high?: number[]; isTotal?: boolean }[] }> = ({
  head,
  rows,
}) => (
  <table className={['future-table', head.some(Boolean) ? '' : 'future-table--headless'].filter(Boolean).join(' ')}>
    {/* Без подписей колонок шапки нет — первая строка без линии сверху */}
    {head.some(Boolean) && (
      <thead>
        <tr className="ts-400-xs">
          {head.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
    )}
    <tbody className="ts-400-s">
      {rows.map((row) => (
        <tr key={row.cells[0]} className={row.isTotal ? 'ts-500-s' : ''}>
          {row.cells.map((cell, i) => (
            <td key={i} className={row.high?.includes(i) ? 'future-table__high' : ''}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

/** Линия по точкам: факт сплошной, прогноз пунктиром, «сейчас» — вертикалью */
export const LineChart: React.FC<{ points: { label: string; value: number }[]; nowIndex: number }> = ({
  points,
  nowIndex,
}) => {
  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const x = (i: number) => (i / (points.length - 1)) * 600;
  const y = (v: number) => 8 + ((max - v) / (max - min || 1)) * 112;
  const line = (from: number, to: number) =>
    points
      .slice(from, to + 1)
      .map((p, i) => `${x(from + i)},${y(p.value)}`)
      .join(' ');
  return (
    <div className="future-line-chart">
      <svg viewBox="0 0 600 128" preserveAspectRatio="none" aria-hidden="true">
        <line x1={x(nowIndex)} y1="0" x2={x(nowIndex)} y2="128" className="future-line-chart__now" vectorEffect="non-scaling-stroke" />
        <polyline points={line(0, nowIndex)} className="future-line-chart__line" vectorEffect="non-scaling-stroke" />
        <polyline
          points={line(nowIndex, points.length - 1)}
          className="future-line-chart__line future-line-chart__line--forecast"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="future-line-chart__labels ts-400-xs">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
};
