import React from 'react';
import { Button, IconButton, Widget } from '@pluginwoman/t-ds';
import { Cross, LinesThreeHorizontalWide, Lock, Plus } from '@pluginwoman/t-ds/icons/20/Stroked';
import { DotsThreeHorizontal } from '@pluginwoman/t-ds/icons/24/Stroked';
import { HOME_WIDGETS, HomeWidgetDef, HomeWidgetId, widgetById } from './homeWidgets';

/** Карточка виджета: заголовок, правый аксессуар (меню / панель настройки / «+») и содержимое */
const WidgetCard: React.FC<{
  widget: HomeWidgetDef;
  accessory: React.ReactNode;
  className?: string;
  dragProps?: React.HTMLAttributes<HTMLDivElement> & { draggable?: boolean };
}> = ({ widget, accessory, className = '', dragProps }) => (
  <div className={`home-widget-cell home-widget-cell--${widget.size} ${className}`} {...dragProps}>
    <Widget
      title={widget.title}
      hasChevron={false}
      hasDescription={false}
      rightAccessory={accessory}
      minContentHeight={0}
      className="home-widget home-widget--small-title"
      contentClassName="home-widget__content"
    >
      {widget.content}
    </Widget>
  </div>
);

/** Виджеты на главной в обычном режиме */
export const WidgetsGrid: React.FC<{ ids: HomeWidgetId[] }> = ({ ids }) =>
  ids.length > 0 ? (
    <div className="widgets-grid">
      {ids.map((id) => (
        <WidgetCard
          key={id}
          widget={widgetById(id)}
          accessory={
            <span className="ds-icon ds-icon--m home-widget-more" aria-label="Действия с виджетом">
              <DotsThreeHorizontal />
            </span>
          }
        />
      ))}
    </div>
  ) : null;

/** Закреплённый блок в режиме настройки — его нельзя убрать или переставить */
const LockedBlock: React.FC<{ title: string }> = ({ title }) => (
  <div className="widgets-locked">
    <span className="ds-icon widgets-locked__icon" aria-hidden="true">
      <Lock />
    </span>
    <span className="ts-500-s">{title}</span>
  </div>
);

interface WidgetsEditorProps {
  draft: HomeWidgetId[];
  onDraftChange: (next: HomeWidgetId[]) => void;
  onReset: () => void;
  onCancel: () => void;
  onSave: () => void;
}

/** Экран «Настройка главной»: добавленные виджеты перетаскиваются и скрываются, скрытые — добавляются «+» */
export const WidgetsEditor: React.FC<WidgetsEditorProps> = ({ draft, onDraftChange, onReset, onCancel, onSave }) => {
  const [dragId, setDragId] = React.useState<HomeWidgetId>();
  const hidden = HOME_WIDGETS.filter((w) => !draft.includes(w.id));

  /** Перетаскиваемый виджет встаёт на место того, над которым его держат */
  const moveTo = (targetId: HomeWidgetId) => {
    if (!dragId || dragId === targetId) return;
    const next = draft.filter((id) => id !== dragId);
    next.splice(draft.indexOf(targetId), 0, dragId);
    onDraftChange(next);
  };

  return (
    <div className="widgets-editor">
      <div className="widgets-editor__bar">
        <span className="ts-500-s">Настройка главной</span>
        <span className="ts-400-s widgets-editor__hint">Перетащите или скройте виджет</span>
        <Button variant="transparent" size="xs" isHugWidth className="widgets-editor__reset" onClick={onReset}>
          Сбросить
        </Button>
        <Button variant="secondary" size="xs" isHugWidth className="widgets-editor__cancel" onClick={onCancel}>
          Отмена
        </Button>
        <Button variant="primary" size="xs" isHugWidth onClick={onSave}>
          Сохранить
        </Button>
      </div>

      <LockedBlock title="Финансы" />

      {draft.length > 0 && (
        <div className="widgets-grid">
          {draft.map((id) => (
            <WidgetCard
              key={id}
              widget={widgetById(id)}
              className={['is-draggable', dragId === id ? 'is-dragging' : ''].join(' ')}
              dragProps={{
                draggable: true,
                onDragStart: (e) => {
                  setDragId(id);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', id);
                },
                onDragEnter: () => moveTo(id),
                onDragOver: (e) => e.preventDefault(),
                onDrop: (e) => e.preventDefault(),
                onDragEnd: () => setDragId(undefined),
              }}
              accessory={
                <span className="widget-edit-panel">
                  <span className="ds-icon widget-edit-panel__icon widget-edit-panel__grab" aria-hidden="true" title="Перетащить">
                    <LinesThreeHorizontalWide />
                  </span>
                  <button
                    type="button"
                    className="widget-edit-panel__icon hoverOpacity"
                    aria-label={`Скрыть виджет «${widgetById(id).title}»`}
                    onClick={() => onDraftChange(draft.filter((d) => d !== id))}
                  >
                    <span className="ds-icon" aria-hidden="true">
                      <Cross />
                    </span>
                  </button>
                </span>
              }
            />
          ))}
        </div>
      )}

      {hidden.length > 0 && (
        <div className="widgets-editor__hidden">
          {draft.length > 0 && <h2 className="ts-600-xl">Скрытые</h2>}
          <div className="widgets-grid">
            {hidden.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                accessory={
                  <IconButton
                    icon={<Plus />}
                    ariaLabel={`Добавить виджет «${widget.title}»`}
                    variant="primary"
                    size="xs"
                    className="widget-add-button"
                    onClick={() => onDraftChange([...draft, widget.id])}
                  />
                }
              />
            ))}
          </div>
        </div>
      )}

      <LockedBlock title="История" />
    </div>
  );
};
