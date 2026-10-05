import React from 'react';
import { Modal, ModalFooter, ModalHeader, TextArea } from '@pluginwoman/t-ds';

interface CommentModalProps {
  isOpen: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (value: string) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ isOpen, initialValue, onClose, onSave }) => {
  const [value, setValue] = React.useState(initialValue);

  // При каждом открытии подставляем текущий комментарий платежа
  React.useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);

  return (
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
      <TextArea
        value={value}
        onChange={setValue}
        placeholder="Например, аренда офиса за апрель"
        description="Комментарий не увидит получатель платежа"
      />
    </Modal>
  );
};
