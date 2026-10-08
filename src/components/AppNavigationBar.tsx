import React from 'react';
import ReactDOM from 'react-dom';
import { MainPageNavigationBar, SCINavigationButton } from '@pluginwoman/t-ds';

export type AppPage = 'main' | 'operations';

interface AppNavigationBarProps {
  page: AppPage;
  onNavigate: (page: AppPage) => void;
}

/**
 * Навбар t-ds с пунктами из макета: «Главная · Операции · Платежи · Сервисы · Знания».
 * В MainPageNavigationBar пункты зашиты, поэтому «Операции» и «Знания» добавляем
 * теми же SCINavigationButton через портал в его <nav> — исходники дизайн-системы не трогаем.
 */
export const AppNavigationBar: React.FC<AppNavigationBarProps> = ({ page, onNavigate }) => {
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

  return (
    <div ref={rootRef}>
      <MainPageNavigationBar
        activeNavItem={page === 'main' ? 'main' : undefined}
        customer="Носковец О.Н., ИП"
        avatarInitials="НО"
        onNavMainClick={() => onNavigate('main')}
      />
      {slots &&
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
