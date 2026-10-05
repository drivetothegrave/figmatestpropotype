import React, { useState } from 'react';
import { StylesPreview } from './preview/StylesPreview';
import { IconsPreview } from './preview/IconsPreview';
import { AtomsPreview } from './preview/AtomsPreview';
import { ComponentsPreview } from './preview/ComponentsPreview';
import { OverlaysPreview } from './preview/OverlaysPreview';
import { PromoPreview } from './preview/PromoPreview';
import PromoLandingPreview from './preview/PromoLandingPreview';
import PageLayoutPreview from './preview/PageLayoutPreview';
import { PagesPreview } from './preview/PagesPreview';
import './App.css';

const App: React.FC = () => {
    if (window.location.pathname === '/promo') {
        return <PromoLandingPreview />;
    }

    if (window.location.pathname === '/page-layout') {
        return <PageLayoutPreview />;
    }

    const [activeTab, setActiveTab] = useState<'styles' | 'icons' | 'atoms' | 'components' | 'promo' | 'overlays' | 'pages'>('atoms');

    return (
        <main className="components-preview">
            <div className="tab-nav-scroll">
            <div className="tab-nav-scroll__track">
            <nav className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'styles' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('styles')}
                >
                    Стили
                </button>
                <button
                    className={`tab-btn ${activeTab === 'icons' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('icons')}
                >
                    Иконки
                </button>
                <button
                    className={`tab-btn ${activeTab === 'atoms' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('atoms')}
                >
                    Атомы
                </button>
                <button
                    className={`tab-btn ${activeTab === 'components' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('components')}
                >
                    Компоненты
                </button>
                <button
                    className={`tab-btn ${activeTab === 'promo' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('promo')}
                >
                    Промо
                </button>
                <button
                    className={`tab-btn ${activeTab === 'overlays' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('overlays')}
                >
                    Оверлеи
                </button>
                <button
                    className={`tab-btn ${activeTab === 'pages' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('pages')}
                >
                    Страницы
                </button>
            </nav>
            </div>
            </div>

            {activeTab === 'styles' && <StylesPreview />}
            {activeTab === 'icons' && <IconsPreview />}
            {activeTab === 'atoms' && <AtomsPreview />}
            {activeTab === 'components' && <ComponentsPreview />}
            {activeTab === 'promo' && <PromoPreview />}
            {activeTab === 'overlays' && <OverlaysPreview />}
            {activeTab === 'pages' && <PagesPreview />}
        </main>
    );
};

export default App;
