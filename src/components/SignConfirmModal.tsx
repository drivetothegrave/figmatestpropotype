import React from 'react';
import { Cell, CellRightAccessory, Modal, ModalFooter, ModalHeader, Tag } from '@pluginwoman/t-ds';
import { Payment, formatRub, paymentsWord } from '../data';

interface SignConfirmModalProps {
  payments: Payment[];
  comments: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Подтверждение подписи: руководитель видит, что именно подписывает */
export const SignConfirmModal: React.FC<SignConfirmModalProps> = ({ payments, comments, isOpen, onClose, onConfirm }) => {
  // Держим последний список, пока модалка анимирует закрытие
  const [shown, setShown] = React.useState(payments);
  React.useEffect(() => {
    if (isOpen) setShown(payments);
  }, [isOpen, payments]);

  const total = shown.reduce((acc, p) => acc + Math.abs(p.sum), 0);
  const title = shown.length === 1 ? 'Подписать платёж?' : `Подписать ${paymentsWord(shown.length)}?`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="sign-confirm"
      header={<ModalHeader title={title} onClose={onClose} />}
      footer={
        <ModalFooter
          layout="2-horizontal-buttons"
          description="Деньги дойдут после 18:00 по Москве"
          secondaryAction={{ label: 'Отмена', onClick: onClose }}
          primaryAction={{ label: 'Подписать', isSelected: true, onClick: onConfirm }}
        />
      }
    >
      <div className="sign-confirm__list">
        {shown.map((payment) => (
          <Cell
            key={payment.id}
            title={payment.counterparty}
            description={
              comments[payment.id] ? (
                <Tag shape="square" size="m" className="comment-tag comment-tag--list">
                  {comments[payment.id]}
                </Tag>
              ) : (
                payment.description
              )
            }
            verticalPadding="3x"
            rightAccessory={<CellRightAccessory variant="text-m" text={formatRub(payment.sum)} />}
          />
        ))}
        {shown.length > 1 && (
          <Cell
            className="sign-confirm__total"
            title="Итого"
            titleClassName="ts-600-m"
            verticalPadding="3x"
            rightAccessory={<CellRightAccessory variant="text-m" text={formatRub(total)} />}
          />
        )}
      </div>
    </Modal>
  );
};
