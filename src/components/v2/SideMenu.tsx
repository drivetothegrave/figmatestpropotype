import React from 'react';
import { Badge } from '@pluginwoman/t-ds';
import { CapGraduation, CoinsRuble, House, LayoutBento, PaperPin, PlusMinusRectangle, Watch } from '@pluginwoman/t-ds/icons/32/Filled';
import type { AppPage } from '../AppNavigationBar';

interface SideMenuProps {
  page: AppPage;
  onNavigate: (page: AppPage) => void;
  /** Счётчик у «Операций» — платежи на подпись */
  operationsBadge: number;
}

const FAVORITES = ['Платёж по реквизитам', 'Платёж через СБП', 'Эквайринг'];
const RECENT = ['Платёж по реквизитам', 'Выписка', 'Обмен валюты', 'Знания, как платить УСН', 'Зарплатный проект'];

/** Пункт меню: иконка 20px, подпись 500/S, справа — бейдж */
const MenuItem: React.FC<{
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  badge?: number;
  tone?: 'default' | 'muted' | 'brand';
  onClick?: () => void;
}> = ({ label, icon, isActive, badge, tone = 'default', onClick }) => {
  const className = [
    'side-menu__item',
    isActive || tone === 'brand' ? 'side-menu__item--brand' : '',
    tone === 'muted' ? 'side-menu__item--muted' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {icon && (
        <span className="ds-icon side-menu__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="ts-500-s side-menu__label">{label}</span>
      {badge ? <Badge value={badge} size="s" color="var(--bg-brand)" textColor="var(--primitive-default)" /> : null}
    </>
  );
  return tone === 'muted' ? (
    <p className={className}>{content}</p>
  ) : (
    <button type="button" className={`${className} hoverOpacity`} aria-current={isActive ? 'page' : undefined} onClick={onClick}>
      {content}
    </button>
  );
};

/** Левое меню редизайна: разделы, избранное и недавние действия */
export const SideMenu: React.FC<SideMenuProps> = ({ page, onNavigate, operationsBadge }) => (
  <aside className="side-menu">
    <nav className="side-menu__group side-menu__group--main">
      <MenuItem label="Главная" icon={<House />} isActive={page === 'main'} onClick={() => onNavigate('main')} />
      <MenuItem
        label="Операции"
        icon={<Watch />}
        isActive={page === 'operations'}
        badge={operationsBadge}
        onClick={() => onNavigate('operations')}
      />
      <MenuItem label="Платежи" icon={<CoinsRuble />} />
      <MenuItem label="Сервисы" icon={<LayoutBento />} />
      <MenuItem label="Знания" icon={<CapGraduation />} />
      <MenuItem label="Бухгалтерия" icon={<PlusMinusRectangle />} />
    </nav>

    <hr className="side-menu__divider" />

    <div className="side-menu__group">
      <MenuItem label="Избранное" tone="muted" />
      {FAVORITES.map((label) => (
        <MenuItem key={label} label={label} icon={<PaperPin />} />
      ))}
    </div>

    <div className="side-menu__group">
      <MenuItem label="Недавние действия" tone="muted" />
      {RECENT.map((label) => (
        <MenuItem key={label} label={label} />
      ))}
      <MenuItem label="Вся история действий" tone="brand" />
    </div>
  </aside>
);
