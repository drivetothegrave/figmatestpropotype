import React from 'react';
import { Avatar, Cell, Drawer, IconButton, Tag } from '@pluginwoman/t-ds';
import {
  ArrowReturnRight,
  CalendarAcsArrowRotationRight,
  Cross,
  Printer,
  Share,
  Star,
} from '@pluginwoman/t-ds/icons';
import { FilePdf } from '@pluginwoman/t-ds/icons/20/Graphic';
import { Payment, STATUS_LABEL } from '../data';

const ACTIONS = [
  { label: 'Повторить', icon: <ArrowReturnRight /> },
  { label: 'Запланировать', icon: <CalendarAcsArrowRotationRight /> },
  { label: 'Поделиться', icon: <Share /> },
  { label: 'Распечатать', icon: <Printer /> },
  { label: 'В шаблоны', icon: <Star /> },
];

interface PaymentDrawerProps {
  payment?: Payment;
  comment?: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentClick: () => void;
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
}) => (
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
              <span className="ts-500-s">{STATUS_LABEL[payment.status]}</span>
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
              <span className="ts-600-4xl">{payment.amount}</span>
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
                {comment || 'Добавить комментарий к платежу'}
              </Tag>
            </button>

            <div className="payment-drawer__actions">
              {ACTIONS.map((action) => (
                <div key={action.label} className="payment-drawer__action">
                  <IconButton icon={action.icon} ariaLabel={action.label} variant="white" size="l" />
                  <span className="ts-500-xs">{action.label}</span>
                </div>
              ))}
            </div>
          </div>

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
