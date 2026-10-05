import React from 'react';
import { Avatar, Cell } from '@pluginwoman/t-ds';
import { ChevronsLeft } from '@pluginwoman/t-ds/icons';
import {
  DocumentListAcsArrowDownOutgoing,
  DotsThreeHorizontal,
  Key,
  PhotoCamera,
  RequisitesListShort,
  RequisitesT,
} from '@pluginwoman/t-ds/icons/32/Stroked';
import { Acquiring, CoinsYuan, HousePercent, Person, PersonAcsRuble } from '@pluginwoman/t-ds/icons/32/Filled';

const QUICK_ACTIONS = [
  { title: 'Скачать выписку', icon: <DocumentListAcsArrowDownOutgoing /> },
  { title: 'Посмотреть реквизиты', icon: <RequisitesListShort /> },
  { title: 'Посмотреть тариф и лимиты', icon: <RequisitesT /> },
  { title: 'Предоставить доступ', icon: <Key /> },
  { title: 'Заплатить по фото или документу', icon: <PhotoCamera /> },
];

const SERVICES = [
  { title: 'Зарплатный проект', icon: <PersonAcsRuble />, color: 'var(--category-emerald)' },
  { title: 'Депозиты', icon: <HousePercent />, color: 'var(--category-mint)' },
  { title: 'Эквайринг и кассы', icon: <Acquiring />, color: 'var(--category-sky)' },
  { title: 'Валютные операции', icon: <CoinsYuan />, color: 'var(--category-amethyst)' },
  { title: 'Контрагенты', icon: <Person />, color: 'var(--category-indigo)' },
];

const SectionHeader: React.FC<{ title: string; hasCollapse?: boolean }> = ({ title, hasCollapse }) => (
  <div className="left-bar__section-header">
    <h2 className="ts-600-xl">{title}</h2>
    {hasCollapse && (
      <span className="ds-icon ds-icon--m left-bar__collapse" aria-hidden="true">
        <ChevronsLeft />
      </span>
    )}
  </div>
);

export const LeftBar: React.FC = () => (
  <aside className="left-bar">
    <div className="left-bar__drop">
      <button type="button" className="left-bar__drop-area hoverOpacity">
        <span className="ts-500-l left-bar__drop-title">Распознать платёж</span>
        <span className="ts-400-s left-bar__drop-subtitle">Фото, 1С или PDF</span>
      </button>
    </div>

    <section>
      <SectionHeader title="Быстрые действия" hasCollapse />
      {QUICK_ACTIONS.map((action) => (
        <Cell
          key={action.title}
          className="left-bar__cell"
          title={action.title}
          verticalPadding="3x"
          leftAccessory={
            <span className="ds-icon ds-icon--l left-bar__action-icon" aria-hidden="true">
              {action.icon}
            </span>
          }
          onClick={() => undefined}
        />
      ))}
      <Cell
        className="left-bar__cell"
        title="Все действия"
        titleColor="var(--primitive-secondary)"
        verticalPadding="3x"
        leftAccessory={
          <span className="ds-icon ds-icon--l left-bar__more-icon" aria-hidden="true">
            <DotsThreeHorizontal />
          </span>
        }
        onClick={() => undefined}
      />
    </section>

    <section>
      <SectionHeader title="Мои сервисы" />
      {SERVICES.map((service) => (
        <Cell
          key={service.title}
          className="left-bar__cell"
          title={service.title}
          verticalPadding="3x"
          leftAccessory={
            <Avatar
              size={32}
              shape="circle"
              icon={service.icon}
              style={{ background: service.color, color: 'var(--primitive-default)' }}
            />
          }
          onClick={() => undefined}
        />
      ))}
    </section>
  </aside>
);
