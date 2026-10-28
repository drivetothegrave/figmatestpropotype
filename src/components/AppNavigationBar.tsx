import React from 'react';
import ReactDOM from 'react-dom';
import { MainPageNavigationBar, SCINavigationButton } from '@pluginwoman/t-ds';

export type AppPage = 'main' | 'operations' | 'payment' | 'tasks';

interface AppNavigationBarProps {
  page: AppPage;
  onNavigate: (page: AppPage) => void;
  /** Когда полный таймлайн живёт на главной, отдельный пункт «Операции» не нужен */
  hasOperations?: boolean;
  /** Редизайн: в шапке только логотип и профиль — разделы переехали в левое меню */
  isMinimal?: boolean;
  /** Высота шапки — чтобы контент и левое меню вставали под неё */
  onHeightChange?: (height: number) => void;
}

/**
 * Навбар t-ds с пунктами из макета: «Главная · Операции · Платежи · Сервисы · Знания».
 * В MainPageNavigationBar пункты зашиты, поэтому «Операции» и «Знания» добавляем
 * теми же SCINavigationButton через портал в его <nav> — исходники дизайн-системы не трогаем.
 */
export const AppNavigationBar: React.FC<AppNavigationBarProps> = ({
  page,
  onNavigate,
  hasOperations = true,
  isMinimal = false,
  onHeightChange,
}) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [slots, setSlots] = React.useState<{ operations: HTMLElement; knowledge: HTMLElement }>();

  React.useLayoutEffect(() => {
    const nav = rootRef.current?.querySelector('.main-page-navigation-bar__desktop .main-page-navigation-bar__nav');
    if (!nav || nav.children.length < 3) return;
    const operations = document.createElement('span');
    const knowledge = document.createElement('span');
    operations.className = 'app-nav__slot';
    knowledge.className = 'app-nav__slot';
    // После «Главная» и в самом конце
    nav.insertBefore(operations, nav.children[1]);
    nav.appendChild(knowledge);
    setSlots({ operations, knowledge });
    return () => {
      operations.remove();
      knowledge.remove();
    };
  }, []);

  // Шапка закреплена при скролле — её высота нужна, чтобы контент и левое меню вставали под неё
  const heightCallback = React.useRef(onHeightChange);
  heightCallback.current = onHeightChange;
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => heightCallback.current?.(root.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={['app-nav', isMinimal ? 'app-nav--minimal' : ''].filter(Boolean).join(' ')}>
      <MainPageNavigationBar
        activeNavItem={page === 'main' ? 'main' : undefined}
        customer="Носковец О.Н., ИП"
        avatarInitials="НО"
        onNavMainClick={() => onNavigate('main')}
      />
      {slots &&
        hasOperations &&
        ReactDOM.createPortal(
          <SCINavigationButton
            label="Операции"
            isActive={page === 'operations'}
            onClick={() => onNavigate('operations')}
          />,
          slots.operations,
        )}
      {slots && ReactDOM.createPortal(<SCINavigationButton label="Знания" />, slots.knowledge)}
    </div>
  );
};
