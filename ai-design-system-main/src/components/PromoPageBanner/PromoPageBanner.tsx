import React from 'react';
import { Button } from '../Button/Button';
import { NavigationBar } from '../NavigationBar/NavigationBar';
import { PromoPageTitle } from '../PromoPageTitle/PromoPageTitle';
import { useIsMobile } from '../../hooks/useIsMobile';
import { BREAKPOINT_TABLET } from '../../breakpoints';
import { PromoPageBannerAib, PromoPageBannerAibItem } from './PromoPageBannerAib';
import './promo-page-banner.css';

export interface PromoPageBannerProps {
  /** Заголовок баннера. Размер переключается автоматически: 5XL на десктопе, 3XL на адаптиве
   * @default "Text 5XL" */
  title?: React.ReactNode;
  /** Описание баннера. Размер переключается автоматически: XL на десктопе, M на адаптиве
   * @default "Text XL" */
  description?: React.ReactNode;
  /** Текст кнопки действия
   * @default "Text M" */
  buttonLabel?: React.ReactNode;
  /** Произвольный элемент-изображение */
  image?: React.ReactNode;
  /** URL изображения (имеет приоритет над `image`) */
  imageSrc?: string;
  /** Alt-текст изображения
   * @default "" */
  imageAlt?: string;
  /** Показывает блок с изображением
   * @default true */
  hasImage?: boolean;
  /** Показывает описание
   * @default true */
  hasDescription?: boolean;
  /** Показывает кнопку действия
   * @default true */
  hasButton?: boolean;
  /** Показывает навигацию внутри баннера
   * @default true */
  hasNavigation?: boolean;
  /** Управляет вылетом изображения за границы баннера
   * @default "hidden" */
  imageOverflow?: 'hidden' | 'visible';
  /** Способ вписывания изображения
   * @default "contain" */
  imageObjectFit?: 'contain' | 'cover';
  /** Позиция изображения внутри блока */
  imageObjectPosition?: string;
  /** Колбэк при нажатии на кнопку */
  onButtonClick?: () => void;
  /** Показывает блок преимуществ AIB
   * @default false */
  hasAib?: boolean;
  /** Пункты блока AIB: от 2 до 4 элементов */
  aibItems?: PromoPageBannerAibItem[];
  /** Показывает иконки в пунктах AIB
   * @default false */
  hasAibIcons?: boolean;
  /** Показывает дескрипторы в пунктах AIB
   * @default false */
  hasAibDescriptions?: boolean;
  /** Дополнительный CSS-класс
   * @default "" */
  className?: string;
}

const DefaultImage = () => (
  <span className="promo-page-banner__default-image" aria-hidden="true" />
);

/**
 * Крупный визуальный блок, выполняющий роль хедера для промо-страниц, онбордингов и других
 * контекстных страниц банка. Предназначен для создания первого впечатления и донесения главного сообщения.
 */
export const PromoPageBanner: React.FC<PromoPageBannerProps> = ({
  title = 'Text 5XL',
  description = 'Text XL',
  buttonLabel = 'Text M',
  image,
  imageSrc,
  imageAlt = '',
  hasImage = true,
  hasDescription = true,
  hasButton = true,
  hasNavigation = true,
  imageOverflow = 'hidden',
  imageObjectFit = 'contain',
  imageObjectPosition,
  onButtonClick,
  hasAib = false,
  aibItems = [],
  hasAibIcons = false,
  hasAibDescriptions = false,
  className = '',
}) => {
  const isMobile = useIsMobile(BREAKPOINT_TABLET);
  const descriptionSizeClass = isMobile ? 'ts-500-m' : 'ts-500-xl';

  const classNames = [
    'promo-page-banner',
    !hasImage && 'promo-page-banner--without-image',
    imageOverflow === 'visible' && 'promo-page-banner--image-overflow-visible',
    className,
  ].filter(Boolean).join(' ');

  const imageContent = imageSrc
    ? (
      <img
        className="promo-page-banner__image-img"
        src={imageSrc}
        alt={imageAlt}
        style={{ objectFit: imageObjectFit, objectPosition: imageObjectPosition }}
      />
    )
    : image || <DefaultImage />;

  const banner = (
    <section className={classNames}>
      {hasNavigation && (
        <NavigationBar
          isInverted
          className="promo-page-banner__navigation"
          titleVariant="none"
          rightAccessoryVariant="none"
        />
      )}
      <div className="promo-page-banner__content">
        {hasImage && (
          <div className="promo-page-banner__image">
            {imageContent}
          </div>
        )}
        <div className="promo-page-banner__info">
          <div className="promo-page-banner__text">
            <PromoPageTitle className="promo-page-banner__title">{title}</PromoPageTitle>
            {hasDescription && description && (
              <p className={`promo-page-banner__description ${descriptionSizeClass}`}>{description}</p>
            )}
          </div>
          {hasButton && (
            <div className="promo-page-banner__button-block">
              <Button
                className="promo-page-banner__button"
                variant="white"
                onClick={onButtonClick}
              >
                {buttonLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  if (!hasAib) {
    return banner;
  }

  return (
    <div className="promo-page-banner-group">
      {banner}
      <PromoPageBannerAib
        items={aibItems}
        hasIcons={hasAibIcons}
        hasDescriptions={hasAibDescriptions}
      />
    </div>
  );
};
