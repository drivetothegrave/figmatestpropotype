import React from 'react';
import { Avatar, Cell, ContextualNotification, Drawer, IconButton, Tag } from '@pluginwoman/t-ds';
import {
  ArrowReturnRight,
  CalendarAcsArrowRotationRight,
  Cross,
  Pen,
  Pencil,
  Printer,
  Share,
  Star,
  Trash,
} from '@pluginwoman/t-ds/icons';
import { FilePdf } from '@pluginwoman/t-ds/icons/20/Graphic';
import { InformationCircle } from '@pluginwoman/t-ds/icons/20/Filled';
import { Payment, STATUS_LABEL, formatAmount } from '../data';

interface DrawerAction {
  label: string;
  icon: React.ReactNode;
  isPrimary?: boolean;
  onClick?: () => void;
}

interface PaymentDrawerProps {
  payment?: Payment;
  comment?: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentClick: () => void;
  onSign: (payment: Payment) => void;
}

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Cell
    title={value}
    subtitle={label}
    verticalPadding="none"
    titleClassName="ts-400-m"
    subtitleClassName="ts-400-s"
    subtitleColor="var(--primitive-secondary)"
  />
);

export const PaymentDrawer: React.FC<PaymentDrawerProps> = ({
  payment,
  comment,
  isOpen,
  onClose,
  onCommentClick,
  onSign,
}) => {
  const isSign = payment?.status === 'sign';

  // Для платежа на подпись — свой набор кнопок (экран «Детали платежа на подпись»)
  const actions: DrawerAction[] = isSign
    ? [
        { label: 'Подписать', icon: <Pen />, isPrimary: true, onClick: () => payment && onSign(payment) },
        { label: 'Запланировать', icon: <CalendarAcsArrowRotationRight /> },
        { label: 'Повторить', icon: <ArrowReturnRight /> },
        { label: 'Редактировать', icon: <Pencil /> },
        { label: 'Удалить', icon: <Trash /> },
      ]
    : [
        { label: 'Повторить', icon: <ArrowReturnRight /> },
        { label: 'Запланировать', icon: <CalendarAcsArrowRotationRight /> },
        { label: 'Поделиться', icon: <Share /> },
        { label: 'Распечатать', icon: <Printer /> },
        { label: 'В шаблоны', icon: <Star /> },
      ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      className="payment-drawer"
      header={
        payment && (
          <div className="payment-drawer__header">
            <div className="payment-drawer__header-meta ts-400-s">
              <span className="payment-drawer__secondary">{payment.dateTime}</span>
              <span className="payment-drawer__secondary">∙</span>
              <span className="ts-500-s" style={{ color: isSign ? 'var(--primitive-brand)' : undefined }}>
                {STATUS_LABEL[payment.status]}
              </span>
            </div>
            <IconButton icon={<Cross />} ariaLabel="Закрыть" variant="transparent" size="xs" onClick={onClose} />
          </div>
        )
      }
    >
      {payment && (
        <div className="payment-drawer__content">
          <div className="payment-drawer__event">
            <div className="payment-drawer__title">
              <span className="ts-600-4xl">{formatAmount(payment.sum)}</span>
              <span className="ts-500-m">{payment.operationName}</span>
            </div>

            <button
              type="button"
              className="payment-drawer__comment hoverOpacity"
              onClick={onCommentClick}
              aria-label={comment ? `Комментарий: ${comment}. Изменить` : 'Добавить комментарий к платежу'}
            >
              <Tag
                shape="circle"
                size="l"
                className={['comment-tag', comment ? '' : 'comment-tag--empty'].filter(Boolean).join(' ')}
              >
                {comment ? (
                  <span className="comment-tag__content">
                    <span className="comment-tag__text">{comment}</span>
                    <span className="ds-icon ds-icon--xs comment-tag__edit" aria-hidden="true">
                      <Pencil />
                    </span>
                  </span>
                ) : (
                  'Добавить комментарий к платежу'
                )}
              </Tag>
            </button>

            <div className="payment-drawer__actions">
              {actions.map((action) => (
                <div key={action.label} className="payment-drawer__action">
                  <IconButton
                    icon={action.icon}
                    ariaLabel={action.label}
                    variant={action.isPrimary ? 'primary' : 'white'}
                    size="l"
                    className={action.isPrimary ? 'payment-drawer__action-primary' : undefined}
                    onClick={action.onClick}
                  />
                  <span className="ts-500-xs">{action.label}</span>
                </div>
              ))}
            </div>
          </div>

          {isSign && (
            // Блок регламента: когда деньги дойдут после подписания
            <ContextualNotification
              text="Деньги дойдут после 18:00 по Москве"
              hasTitle={false}
              hasCloseIcon={false}
              accessory="icon"
              icon={<InformationCircle />}
              className="payment-drawer__notification"
            />
          )}

          <div className="payment-drawer__details">
            <Detail label="Назначение платежа" value={payment.description} />
            <Detail label="Получатель" value={payment.recipient} />
            <div className="payment-drawer__grid">
              <Detail label="ИНН" value={payment.inn} />
              <Detail label="КПП" value={payment.kpp} />
              <Detail label="Номер счёта" value={payment.account} />
              <Detail label="БИК" value={payment.bik} />
              <Detail label="Наименование банка" value={payment.bank} />
              <Detail label="Корсчёт" value={payment.corrAccount} />
            </div>
            {payment.createdAt && <Detail label="Создано" value={payment.createdAt} />}
            {payment.createdBy && <Detail label="Кто создал" value={payment.createdBy} />}
          </div>

          <div className="payment-drawer__navigator">
            <h3 className="ts-600-xl">Документы</h3>
            <Cell
              title="Платёжное поручение"
              verticalPadding="2x"
              leftAccessory={
                <Avatar
                  size={32}
                  shape="square"
                  icon={
                    <span className="ds-icon ds-icon--s" aria-hidden="true">
                      <FilePdf />
                    </span>
                  }
                />
              }
              onClick={() => undefined}
            />
          </div>

          <div className="payment-drawer__navigator">
            <h3 className="ts-600-xl">Со счёта</h3>
            <Cell
              title="50 275,37 ₽"
              description="Мой расчётный, **2324"
              verticalPadding="2x"
              leftAccessory={<Avatar size={32} shape="circle" label="₽" />}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
};
