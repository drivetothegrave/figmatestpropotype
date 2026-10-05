import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { BottomSheetHeader } from '../BottomSheet/BottomSheetHeader';
import './tooltip.css';

type TooltipPlacement = 'right' | 'left';
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface TooltipProps {
  /** Элемент-триггер, при наведении или фокусе на который появляется подсказка */
  trigger: React.ReactNode;
  /** Содержимое подсказки */
  children: React.ReactNode;
  /** Заголовок, отображаемый в шапке BottomSheet на мобильном. На десктопе не используется. */
  title?: React.ReactNode;
  /** Предпочтительное положение подсказки относительно триггера.
   * Если у края viewport недостаточно места, сторона автоматически меняется.
   * @default "right" */
  placement?: TooltipPlacement;
  /** Контролируемое состояние видимости. Если передан — компонент переходит в controlled mode */
  isOpen?: boolean;
  /** Начальное состояние для неконтролируемого режима
   * @default false */
  defaultOpen?: boolean;
  /** Колбэк при изменении видимости */
  onOpenChange?: (isOpen: boolean) => void;
  /** Дополнительный CSS-класс для обёртки
   * @default "" */
  className?: string;
}

/**
 * Всплывающая подсказка, появляющаяся при наведении или фокусе на элемент-триггер.
 * На мобильном (≤600px) открывается как BottomSheet.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  trigger,
  children,
  title,
  placement = 'right',
  isOpen,
  defaultOpen = false,
  onOpenChange,
  className = '',
}) => {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [resolvedPlacement, setResolvedPlacement] = useState<TooltipPlacement>(placement);
  const anchorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isControlled = isOpen !== undefined;
  const isTooltipOpen = isControlled ? isOpen : internalOpen;

  useEffect(() => {
    if (isControlled) return;
    setInternalOpen(defaultOpen);
  }, [defaultOpen, isControlled]);

  const setOpen = (nextValue: boolean) => {
    if (!isControlled) setInternalOpen(nextValue);
    onOpenChange?.(nextValue);
  };

  const updatePlacement = useCallback(() => {
    if (typeof window === 'undefined' || !anchorRef.current || !tooltipRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const measuredGap = resolvedPlacement === 'right'
      ? tooltipRect.left - anchorRect.right
      : anchorRect.left - tooltipRect.right;
    const gap = Math.max(0, measuredGap);
    const availableSpace: Record<TooltipPlacement, number> = {
      right: window.innerWidth - anchorRect.right - gap,
      left: anchorRect.left - gap,
    };
    const oppositePlacement: TooltipPlacement = placement === 'right' ? 'left' : 'right';
    const nextPlacement = availableSpace[placement] >= tooltipRect.width
      ? placement
      : availableSpace[oppositePlacement] >= tooltipRect.width
        ? oppositePlacement
        : availableSpace[oppositePlacement] > availableSpace[placement]
          ? oppositePlacement
          : placement;

    setResolvedPlacement(currentPlacement => (
      currentPlacement === nextPlacement ? currentPlacement : nextPlacement
    ));
  }, [placement, resolvedPlacement]);

  useIsomorphicLayoutEffect(() => {
    if (!isMobile) updatePlacement();
  }, [isMobile, isTooltipOpen, updatePlacement]);

  useEffect(() => {
    if (isMobile || !isTooltipOpen) return;

    window.addEventListener('scroll', updatePlacement, { capture: true });
    window.addEventListener('resize', updatePlacement);

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updatePlacement)
      : undefined;

    if (anchorRef.current) resizeObserver?.observe(anchorRef.current);
    if (tooltipRef.current) resizeObserver?.observe(tooltipRef.current);

    return () => {
      window.removeEventListener('scroll', updatePlacement, { capture: true });
      window.removeEventListener('resize', updatePlacement);
      resizeObserver?.disconnect();
    };
  }, [isMobile, isTooltipOpen, updatePlacement]);

  const rootClassName = ['tooltip-anchor', className].filter(Boolean).join(' ');
  const panelClassName = [
    'tooltip',
    `tooltip--${resolvedPlacement}`,
    !isTooltipOpen && 'tooltip--hidden',
  ].filter(Boolean).join(' ');

  const content = typeof children === 'string'
    ? <p className="tooltip__paragraph ts-400-s">{children}</p>
    : children;

  const desktopHandlers = {
    onMouseEnter: () => {
      updatePlacement();
      setOpen(true);
    },
    onMouseLeave: () => setOpen(false),
    onFocus: () => {
      updatePlacement();
      setOpen(true);
    },
    onBlur: (event: React.FocusEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setOpen(false);
      }
    },
  };

  const mobileHandlers = {
    onClick: () => setOpen(!isTooltipOpen),
  };

  return (
    <div ref={anchorRef} className={rootClassName} {...(isMobile ? mobileHandlers : desktopHandlers)}>
      <div className="tooltip-anchor__trigger hoverOpacity">{trigger}</div>

      {isMobile ? (
        <BottomSheet
          isOpen={isTooltipOpen}
          onClose={() => setOpen(false)}
          header={title ? <BottomSheetHeader title={title} /> : undefined}
        >
          {content}
        </BottomSheet>
      ) : (
        <div
          ref={tooltipRef}
          className={panelClassName}
          role="tooltip"
          aria-hidden={!isTooltipOpen}
        >
          <div className="tooltip__arrow" aria-hidden="true" />
          <div className="tooltip__content">{content}</div>
        </div>
      )}
    </div>
  );
};
