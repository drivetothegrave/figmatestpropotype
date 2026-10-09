import React from 'react';
import ReactDOM from 'react-dom';
import { Cell, IconButton } from '@pluginwoman/t-ds';
import { Cross } from '@pluginwoman/t-ds/icons';

interface SuggestPopupProps {
  /** Элемент, под которым показывается список */
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  items: string[];
  activeIndex: number;
  onSelect: (item: string) => void;
  /** Если передан — у каждого пункта появляется крестик удаления */
  onRemove?: (item: string) => void;
}

type Position = { top: number; left: number; width: number };

/**
 * Выпадающий список подсказок (паттерн «Dropdown Select» из макета).
 * Рендерится порталом, чтобы не обрезаться прокруткой модалки и лежать поверх её футера.
 */
export const SuggestPopup: React.FC<SuggestPopupProps> = ({
  anchorRef,
  isOpen,
  items,
  activeIndex,
  onSelect,
  onRemove,
}) => {
  const [position, setPosition] = React.useState<Position>();

  React.useLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) setPosition({ top: rect.bottom, left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen, anchorRef, items.length]);

  if (!isOpen || items.length === 0 || !position) return null;

  return ReactDOM.createPortal(
    <div
      className="suggest-popup"
      role="listbox"
      style={{ top: position.top, left: position.left, width: position.width }}
      // Не отдаём фокус из поля ввода при клике по списку
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.map((item, index) => (
        <Cell
          key={item}
          className={['suggest-popup__item', index === activeIndex ? 'is-active' : ''].filter(Boolean).join(' ')}
          title={item}
          titleClassName="ts-400-m"
          verticalPadding="2x"
          onClick={() => onSelect(item)}
          rightAccessory={
            onRemove && (
              // Cell ловит клик всей строкой — не даём крестику выбрать подсказку
              <span onClick={(e) => e.stopPropagation()}>
                <IconButton
                  icon={<Cross />}
                  ariaLabel={`Удалить подсказку «${item}»`}
                  variant="transparent"
                  size="xs"
                  className="suggest-popup__remove"
                  onClick={() => onRemove(item)}
                />
              </span>
            )
          }
        />
      ))}
    </div>,
    document.body,
  );
};

/** Навигация по списку стрелками, выбор Enter, закрытие Escape */
export function useSuggestKeyboard(items: string[], isOpen: boolean, onSelect: (item: string) => void, onClose: () => void) {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  React.useEffect(() => setActiveIndex(-1), [items.join('\n'), isOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      onSelect(items[activeIndex]);
    } else if (e.key === 'Escape') {
      // Сначала закрываем подсказки, а не модалку/дровер; и не даём браузеру очистить поле type="search"
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  return { activeIndex, onKeyDown };
}
