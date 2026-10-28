import React from 'react';
import { Badge, ContextMenu } from '@pluginwoman/t-ds';
import { CapGraduation, CoinsRuble, House, LayoutBento, PaperPin, PlusMinusRectangle, Watch } from '@pluginwoman/t-ds/icons/32/Filled';
import { DotsThreeHorizontal } from '@pluginwoman/t-ds/icons/20/Stroked';
import type { AppPage } from '../AppNavigationBar';

interface SideMenuProps {
  page: AppPage;
  onNavigate: (page: AppPage) => void;
  /** Счётчик у «Операций» — платежи на подпись */
  operationsBadge: number;
  /** Избранное — быстрые переходы, которые клиент закрепил сам */
  favorites: string[];
  onFavoritesChange: (next: string[]) => void;
  /** Недавние действия — страницы, на которые клиент переходил */
  recent: string[];
  /** Клик по пункту избранного или недавних — переход на его страницу, если она есть в прототипе */
  onOpenShortcut: (label: string) => void;
}

/** По умолчанию в избранном и в недавних — как в макете; переходы добавим позже */
export const DEFAULT_FAVORITES = ['Платёж по реквизитам', 'Платёж через СБП', 'Эквайринг'];
export const DEFAULT_RECENT = ['Платёж по реквизитам', 'Выписка', 'Обмен валюты', 'Знания, как платить УСН', 'Зарплатный проект'];

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

/**
 * Пункт «Избранного» или «Недавних»: при наведении справа «⋯», по нему — меню
 * «В избранное» / «Убрать из избранного» (как избранные проекты и чаты в Claude).
 */
const ShortcutItem: React.FC<{
  label: string;
  icon?: React.ReactNode;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpen: () => void;
}> = ({ label, icon, isFavorite, onToggleFavorite, onOpen }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className={['side-menu__shortcut', isOpen ? 'is-open' : ''].filter(Boolean).join(' ')}>
      <MenuItem label={label} icon={icon} onClick={onOpen} />
      <ContextMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="side-menu__more"
        items={[
          {
            key: 'favorite',
            label: isFavorite ? 'Убрать из избранного' : 'В избранное',
            onClick: onToggleFavorite,
          },
        ]}
        trigger={
          <button
            type="button"
            className="side-menu__more-button hoverOpacity"
            aria-label={`Действия: ${label}`}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
          >
            <span className="ds-icon side-menu__more-icon" aria-hidden="true">
              <DotsThreeHorizontal />
            </span>
          </button>
        }
      />
    </div>
  );
};

/** Левое меню редизайна: разделы, избранное и недавние действия */
export const SideMenu: React.FC<SideMenuProps> = ({
  page,
  onNavigate,
  operationsBadge,
  favorites,
  onFavoritesChange,
  recent,
  onOpenShortcut,
}) => {
  const toggleFavorite = (label: string) =>
    onFavoritesChange(favorites.includes(label) ? favorites.filter((f) => f !== label) : [...favorites, label]);

  return (
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
        {/* Корневого раздела платежей пока нет — пункт только подсвечивается на странице платежа */}
        <MenuItem label="Платежи" icon={<CoinsRuble />} isActive={page === 'payment'} />
        <MenuItem label="Сервисы" icon={<LayoutBento />} />
        <MenuItem label="Знания" icon={<CapGraduation />} />
        <MenuItem label="Бухгалтерия" icon={<PlusMinusRectangle />} />
      </nav>

      <hr className="side-menu__divider" />

      {favorites.length > 0 && (
        <div className="side-menu__group">
          <MenuItem label="Избранное" tone="muted" />
          {favorites.map((label) => (
            <ShortcutItem
              key={label}
              label={label}
              icon={<span className="side-menu__pin"><PaperPin /></span>}
              isFavorite
              onToggleFavorite={() => toggleFavorite(label)}
              onOpen={() => onOpenShortcut(label)}
            />
          ))}
        </div>
      )}

      <div className="side-menu__group">
        <MenuItem label="Недавние действия" tone="muted" />
        {recent.map((label) => (
          <ShortcutItem
            key={label}
            label={label}
            // В «Недавних» всегда «В избранное»; если пункт уже в избранном — он там не дублируется
            isFavorite={false}
            onToggleFavorite={() => !favorites.includes(label) && onFavoritesChange([...favorites, label])}
            onOpen={() => onOpenShortcut(label)}
          />
        ))}
        <MenuItem label="Вся история действий" tone="brand" />
      </div>
    </aside>
  );
};
