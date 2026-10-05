import React, { useEffect } from 'react';
import {
  Footer,
  MainPageNavigationBar,
  mainNavHeight,
  NavigationBar,
  PageLayout,
} from '../../src';
import './PageLayoutPreview.css';

const PageLayoutPreview: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('page-layout-demo-body');

    return () => document.body.classList.remove('page-layout-demo-body');
  }, []);

  return (
    <div className="page-layout-demo">
      <MainPageNavigationBar
        customer="Название компании"
        avatarInitials="НК"
        hasNewPush={false}
      />

      <PageLayout
        size="s"
        topOffset={mainNavHeight}
        navigationBar={(
          <NavigationBar
            title="Название раздела"
            description="Описание раздела"
            rootLinkLabel="Корневой раздел"
            hasActionButton={false}
            titleVariant="title"
            rightAccessoryVariant="none"
            items={[
              { kind: 'link', label: 'Пункт навигации' },
              { kind: 'link', label: 'Пункт навигации' },
              { kind: 'link', label: 'Пункт навигации' },
              { kind: 'link', label: 'Пункт навигации' },
            ]}
          />
        )}
        rightPanel={(
          <aside className="page-layout-demo__widgets" aria-label="Панель виджетов">
            <div className="page-layout-demo__placeholder page-layout-demo__placeholder--widgets">
              <span className="ts-500-m">Тут панель виджетов</span>
            </div>
          </aside>
        )}
      >
        <main className="page-layout-demo__content">
          <div className="page-layout-demo__placeholder page-layout-demo__placeholder--content">
            <span className="ts-500-m">Тут контент страницы</span>
          </div>
        </main>
      </PageLayout>

      <Footer
        className="page-layout-demo__footer"
        layout="2-buttons-in-line"
        secondaryAction={{ label: 'Текст вторичной кнопки', onClick: () => {} }}
        primaryAction={{ label: 'Текст основной кнопки', onClick: () => {} }}
      />
    </div>
  );
};

export default PageLayoutPreview;
