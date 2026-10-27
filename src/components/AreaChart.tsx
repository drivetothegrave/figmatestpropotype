import React from 'react';

/** Площадной график: линия + заливка; при наведении — точка, вертикаль и подсказка с подписью и суммой */
export const AreaChart: React.FC<{
  values: number[];
  /** Подпись точки в подсказке: дата или месяц */
  labels: string[];
  /** Значение точки в подсказке */
  formatValue: (index: number) => string;
  className?: string;
}> = ({ values, labels, formatValue, className = '' }) => {
  const width = 400;
  const height = 93;
  const [active, setActive] = React.useState<number>();
  // Несколько графиков на странице — у каждого своя заливка
  const gradientId = `area-${React.useId().replace(/:/g, '')}`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * width,
    height - ((v - min) / (max - min || 1)) * (height - 8) - 4,
  ]);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  // Ближайшая к курсору опорная точка
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setActive(Math.round(ratio * (values.length - 1)));
  };

  const point = active !== undefined ? points[active] : undefined;
  const left = point ? (point[0] / width) * 100 : 0;
  const top = point ? (point[1] / height) * 100 : 0;

  return (
    <div className={['finance-chart', className].filter(Boolean).join(' ')} onMouseMove={onMove} onMouseLeave={() => setActive(undefined)}>
      <svg className="finance-widget__chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" className="finance-widget__area-stop finance-widget__area-stop--top" />
            <stop offset="100%" className="finance-widget__area-stop" />
          </linearGradient>
        </defs>
        <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${gradientId})`} />
        <path d={line} className="finance-widget__line" vectorEffect="non-scaling-stroke" />
      </svg>

      {point && active !== undefined && (
        <>
          <span className="finance-chart__rule" style={{ left: `${left}%`, top: `${top}%` }} />
          <span className="finance-chart__dot" style={{ left: `${left}%`, top: `${top}%` }} />
          {/* Подсказка справа снизу от точки; у правого края — слева, у низких точек — над точкой (виджет обрезает выступы) */}
          <div
            className={[
              'finance-chart__tooltip',
              left > 70 ? 'finance-chart__tooltip--left' : '',
              top > 45 ? 'finance-chart__tooltip--above' : '',
            ].join(' ')}
            style={{ left: `${left}%`, top: `${top}%` }}
            role="tooltip"
          >
            <span className="ts-400-xs finance-widget__secondary">{labels[active]}</span>
            <span className="ts-500-xs">{formatValue(active)}</span>
          </div>
        </>
      )}
    </div>
  );
};

