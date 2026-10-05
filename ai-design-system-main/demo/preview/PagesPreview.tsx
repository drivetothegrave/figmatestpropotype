import React from 'react';
import { Button } from '../../src';
import './PagesPreview.css';

const pages = [
  {
    title: 'Промо',
    description: 'Промо-лендинг с баннером, шагами и CTA',
    href: '/promo',
  },
  {
    title: 'Обычный layout',
    description: 'Стандартная страница с шапкой, тремя колонками и футером',
    href: '/page-layout',
  },
];

export const PagesPreview: React.FC = () => (
  <div className="pages-preview">
    {pages.map((page) => (
      <section className="component-screen pages-preview__section" key={page.href}>
        <h1 className="component-screen__title ts-600-2xl">{page.title}</h1>
        <div className="preview-grid preview-grid--inspector pages-preview__row">
          <div className="pages-preview__description">
            <p className="ts-400-m">{page.description}</p>
          </div>
          <div className="preview-stage">
            <Button size="m" onClick={() => { window.location.assign(page.href); }}>
              Открыть
            </Button>
          </div>
        </div>
      </section>
    ))}
  </div>
);
