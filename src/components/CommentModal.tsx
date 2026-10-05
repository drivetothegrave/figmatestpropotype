import React from 'react';
import { Modal, ModalFooter, ModalHeader, TextArea } from '@pluginwoman/t-ds';
import { SuggestPopup, useSuggestKeyboard } from './SuggestPopup';
import { matchSuggestions } from '../suggest';

interface CommentModalProps {
  isOpen: boolean;
  initialValue: string;
  /** Ранее введённые комментарии — для подсказок */
  history: string[];
  onRemoveFromHistory: (item: string) => void;
  onClose: () => void;
  onSave: (value: string) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  initialValue,
  history,
  onRemoveFromHistory,
  onClose,
  onSave,
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isSuggestClosed, setIsSuggestClosed] = React.useState(false);
  const fieldRef = React.useRef<HTMLDivElement>(null);

  // При каждом открытии подставляем текущий комментарий платежа
  React.useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setIsSuggestClosed(false);
    }
  }, [isOpen, initialValue]);

  const suggestions = isOpen
    ? matchSuggestions(history, value, 6).filter((item) => item !== value.trim())
    : [];
  const isSuggestOpen = isOpen && isFocused && !isSuggestClosed && suggestions.length > 0;

  const select = (item: string) => {
    setValue(item);
    setIsSuggestClosed(true);
  };

  const keyboard = useSuggestKeyboard(suggestions, isSuggestOpen, select, () => setIsSuggestClosed(true));

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isOverlayCloseEnabled
        className="comment-modal"
        header={<ModalHeader title="Комментарий к платежу" onClose={onClose} />}
        footer={
          <ModalFooter
            layout="1-button"
            primaryAction={{ label: 'Сохранить', isSelected: true, onClick: () => onSave(value.trim()) }}
          />
        }
      >
        <div
          ref={fieldRef}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={keyboard.onKeyDown}
        >
          <TextArea
            value={value}
            onChange={(next) => {
              setValue(next);
              setIsSuggestClosed(false);
            }}
            placeholder="Например, аренда офиса за апрель"
            description="Комментарий не увидит получатель платежа"
          />
        </div>
      </Modal>

      <SuggestPopup
        anchorRef={fieldRef}
        isOpen={isSuggestOpen}
        items={suggestions}
        activeIndex={keyboard.activeIndex}
        onSelect={select}
        onRemove={onRemoveFromHistory}
      />
    </>
  );
};
