import React from 'react';
import './promo-page-banner-aib.css';

export interface PromoPageBannerAibItem {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface PromoPageBannerAibProps {
  items: PromoPageBannerAibItem[];
  hasIcons?: boolean;
  hasDescriptions?: boolean;
}

export const PromoPageBannerAib: React.FC<PromoPageBannerAibProps> = ({
  items,
  hasIcons = false,
  hasDescriptions = false,
}) => {
  if (items.length < 2 || items.length > 4) {
    throw new Error('PromoPageBanner AIB requires between 2 and 4 items.');
  }

  const classNames = [
    'promo-page-banner-aib',
    `promo-page-banner-aib--${items.length}-items`,
    hasIcons && 'promo-page-banner-aib--with-icons',
    hasDescriptions && 'promo-page-banner-aib--with-descriptions',
  ].filter(Boolean).join(' ');
  const descriptionClassName = items.length === 4 ? 'ts-500-m' : 'ts-500-l';

  return (
    <section className={classNames} aria-label="Преимущества">
      {items.map((item, index) => (
        <article className="promo-page-banner-aib__item" key={index}>
          {hasIcons && item.icon && (
            <div className="promo-page-banner-aib__icon" aria-hidden="true">
              {item.icon}
            </div>
          )}
          <div className="promo-page-banner-aib__text">
            <h3 className="promo-page-banner-aib__title ts-600-xl">{item.title}</h3>
            {hasDescriptions && item.description && (
              <p className={`promo-page-banner-aib__description ${descriptionClassName}`}>
                {item.description}
              </p>
            )}
          </div>
        </article>
      ))}
    </section>
  );
};
