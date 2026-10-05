import React, { useState } from 'react';
import {
    Button,
    Cell,
    Dropdown,
    Input,
    PromoPageBanner,
    PromoPageCard,
    PromoPageCta,
    PromoPageHorizontalCard,
    PromoPageSteps,
    PromoPageTitle,
    Switch,
} from '../../src';
import { Circle } from '../../src/assets/Icon/32/Filled';

export const PromoPreview: React.FC = () => {
    const [isPromoAvatarVisible, setIsPromoAvatarVisible] = useState(true);
    const [isPromoImageVisible, setIsPromoImageVisible] = useState(true);
    const [isPromoDescriptionVisible, setIsPromoDescriptionVisible] = useState(true);
    const [isPromoHorizontal, setIsPromoHorizontal] = useState(false);
    const [isPromoBannerImageVisible, setIsPromoBannerImageVisible] = useState(true);
    const [isPromoBannerDescriptionVisible, setIsPromoBannerDescriptionVisible] = useState(true);
    const [isPromoBannerButtonVisible, setIsPromoBannerButtonVisible] = useState(true);
    const [isPromoBannerNavigationVisible, setIsPromoBannerNavigationVisible] = useState(true);
    const [isPromoBannerImageOverflowVisible, setIsPromoBannerImageOverflowVisible] = useState(false);
    const [isPromoBannerAibVisible, setIsPromoBannerAibVisible] = useState(true);
    const [isPromoBannerAibIconsVisible, setIsPromoBannerAibIconsVisible] = useState(true);
    const [isPromoBannerAibDescriptionsVisible, setIsPromoBannerAibDescriptionsVisible] = useState(true);
    const [promoBannerAibItemsCount, setPromoBannerAibItemsCount] = useState(3);
    const [isPromoHorizontalCardAccent, setIsPromoHorizontalCardAccent] = useState(false);
    const [isPromoHorizontalCardDescriptionVisible, setIsPromoHorizontalCardDescriptionVisible] = useState(true);
    const [isPromoHorizontalCardButtonVisible, setIsPromoHorizontalCardButtonVisible] = useState(true);
    const [isPromoHorizontalCardImageOverflowVisible, setIsPromoHorizontalCardImageOverflowVisible] = useState(false);
    const [isPromoCtaSuccess, setIsPromoCtaSuccess] = useState(false);
    const [isPromoCtaContentVariant, setIsPromoCtaContentVariant] = useState(false);
    const [isPromoStepsTagVisible, setIsPromoStepsTagVisible] = useState(true);
    const [isPromoStepsContentVisible, setIsPromoStepsContentVisible] = useState(true);
    const [phoneValue, setPhoneValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');

    const promoBannerAibItems = [
        {
            icon: <Circle />,
            title: 'Title',
            description: 'Descriptor',
        },
        {
            icon: <Circle />,
            title: 'Title',
            description: 'Descriptor',
        },
        {
            icon: <Circle />,
            title: 'Title',
            description: 'Descriptor',
        },
        {
            icon: <Circle />,
            title: 'Title',
            description: 'Descriptor',
        },
    ];

    return (
        <div className="tab-panel is-active">
            <section className="component-screen">
                <h1 className="component-screen__title ts-600-2xl">Promo Page Banner</h1>
                <div className="preview-grid preview-grid--inspector" style={{ overflowX: 'auto' }}>
                    <div className="preview-controls">
                        <div className="preview-cell-switches">
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Image</span>
                                <Switch
                                    label="Banner image"
                                    isSelected={isPromoBannerImageVisible}
                                    onChange={setIsPromoBannerImageVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Description</span>
                                <Switch
                                    label="Banner description"
                                    isSelected={isPromoBannerDescriptionVisible}
                                    onChange={setIsPromoBannerDescriptionVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Button</span>
                                <Switch
                                    label="Banner button"
                                    isSelected={isPromoBannerButtonVisible}
                                    onChange={setIsPromoBannerButtonVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Navigation</span>
                                <Switch
                                    label="Banner navigation"
                                    isSelected={isPromoBannerNavigationVisible}
                                    onChange={setIsPromoBannerNavigationVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Image overflow</span>
                                <Switch
                                    label="Banner image overflow"
                                    isSelected={isPromoBannerImageOverflowVisible}
                                    onChange={setIsPromoBannerImageOverflowVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">AIB</span>
                                <Switch
                                    label="Banner AIB"
                                    isSelected={isPromoBannerAibVisible}
                                    onChange={setIsPromoBannerAibVisible}
                                />
                            </div>
                            {isPromoBannerAibVisible && (
                                <>
                                    <div className="preview-cell-switches__item">
                                        <span className="ts-500-m">AIB icons</span>
                                        <Switch
                                            label="AIB icons"
                                            isSelected={isPromoBannerAibIconsVisible}
                                            onChange={setIsPromoBannerAibIconsVisible}
                                        />
                                    </div>
                                    <div className="preview-cell-switches__item">
                                        <span className="ts-500-m">AIB descriptions</span>
                                        <Switch
                                            label="AIB descriptions"
                                            isSelected={isPromoBannerAibDescriptionsVisible}
                                            onChange={setIsPromoBannerAibDescriptionsVisible}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        {isPromoBannerAibVisible && (
                            <Dropdown label="AIB items" value={String(promoBannerAibItemsCount)} hasHelpIcon={false}>
                                {[2, 3, 4].map(count => (
                                    <Cell
                                        key={count}
                                        title={String(count)}
                                        hasLeftAccessory={false}
                                        hasRightAccessory={false}
                                        onClick={() => setPromoBannerAibItemsCount(count)}
                                    />
                                ))}
                            </Dropdown>
                        )}
                    </div>
                    <div className="preview-stage">
                        <PromoPageBanner
                            title="Text 5XL"
                            description="Text XL"
                            buttonLabel="Text M"
                            hasImage={isPromoBannerImageVisible}
                            hasDescription={isPromoBannerDescriptionVisible}
                            hasButton={isPromoBannerButtonVisible}
                            hasNavigation={isPromoBannerNavigationVisible}
                            imageOverflow={isPromoBannerImageOverflowVisible ? 'visible' : 'hidden'}
                            imageObjectFit="contain"
                            imageObjectPosition="center"
                            hasAib={isPromoBannerAibVisible}
                            aibItems={promoBannerAibItems.slice(0, promoBannerAibItemsCount)}
                            hasAibIcons={isPromoBannerAibIconsVisible}
                            hasAibDescriptions={isPromoBannerAibDescriptionsVisible}
                        />
                    </div>
                </div>
            </section>
            <section className="component-screen">
                <h1 className="component-screen__title ts-600-2xl">Promo Page Horizontal Card</h1>
                <div className="preview-grid preview-grid--inspector" style={{ overflowX: 'auto' }}>
                    <div className="preview-controls">
                        <div className="preview-cell-switches">
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Accent</span>
                                <Switch
                                    label="Horizontal card accent state"
                                    isSelected={isPromoHorizontalCardAccent}
                                    onChange={setIsPromoHorizontalCardAccent}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Description</span>
                                <Switch
                                    label="Horizontal card description"
                                    isSelected={isPromoHorizontalCardDescriptionVisible}
                                    onChange={setIsPromoHorizontalCardDescriptionVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Button</span>
                                <Switch
                                    label="Horizontal card button"
                                    isSelected={isPromoHorizontalCardButtonVisible}
                                    onChange={setIsPromoHorizontalCardButtonVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Image overflow</span>
                                <Switch
                                    label="Horizontal card image overflow"
                                    isSelected={isPromoHorizontalCardImageOverflowVisible}
                                    onChange={setIsPromoHorizontalCardImageOverflowVisible}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="preview-stage">
                        <PromoPageHorizontalCard
                            title="Text 2XL"
                            description="Text L"
                            buttonLabel="Text M"
                            variant={isPromoHorizontalCardAccent ? 'accent' : 'default'}
                            hasDescription={isPromoHorizontalCardDescriptionVisible}
                            hasButton={isPromoHorizontalCardButtonVisible}
                            imageOverflow={isPromoHorizontalCardImageOverflowVisible ? 'visible' : 'hidden'}
                            imageObjectFit="cover"
                            imageObjectPosition="center"
                        />
                    </div>
                </div>
            </section>
            <section className="component-screen">
                <h1 className="component-screen__title ts-600-2xl">Promo Page Card</h1>
                <div className="preview-grid preview-grid--inspector">
                    <div className="preview-controls">
                        <div className="preview-cell-switches">
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Avatar</span>
                                <Switch
                                    label="Avatar"
                                    isSelected={isPromoAvatarVisible}
                                    onChange={setIsPromoAvatarVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Image</span>
                                <Switch
                                    label="Image"
                                    isSelected={isPromoImageVisible}
                                    onChange={setIsPromoImageVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Description</span>
                                <Switch
                                    label="Description"
                                    isSelected={isPromoDescriptionVisible}
                                    onChange={setIsPromoDescriptionVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Horizontal</span>
                                <Switch
                                    label="Horizontal"
                                    isSelected={isPromoHorizontal}
                                    onChange={setIsPromoHorizontal}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="preview-stage">
                        <PromoPageCard
                            title="Text XL"
                            description="Text M"
                            hasAvatar={isPromoAvatarVisible}
                            hasImage={isPromoImageVisible}
                            hasDescription={isPromoDescriptionVisible}
                            isHorizontal={isPromoHorizontal}
                        />
                    </div>
                </div>
            </section>
            <section className="component-screen">
                <h1 className="component-screen__title ts-600-2xl">Promo Page Title</h1>
                <div className="preview-stage">
                    <PromoPageTitle>Text 5XL</PromoPageTitle>
                </div>
            </section>
            <section className="component-screen">
                <h1 className="component-screen__title ts-600-2xl">Promo Page CTA</h1>
                <div className="preview-grid preview-grid--inspector" style={{ overflowX: 'auto' }}>
                    <div className="preview-controls">
                        <div className="preview-cell-switches">
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Content variant</span>
                                <Switch
                                    label="CTA content variant"
                                    isSelected={isPromoCtaContentVariant}
                                    onChange={setIsPromoCtaContentVariant}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Success</span>
                                <Switch
                                    label="CTA success state"
                                    isSelected={isPromoCtaSuccess}
                                    onChange={setIsPromoCtaSuccess}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="preview-stage">
                        <PromoPageCta
                            title="Проверьте предложение"
                            description="Заполните данные, чтобы получить результат"
                            variant={isPromoCtaContentVariant ? 'content' : 'form'}
                            isSuccess={isPromoCtaSuccess}
                            successTitle="Получили вашу заявку"
                            successDescription="Перезвоним в течение рабочего дня, чтобы уточнить все детали"
                            successAction={{ label: 'Вернуться к форме' }}
                            successImageSrc="/assets/shared/cta-success.png"
                            successImageAlt="Человек ловит бумажный самолётик у футбольных ворот"
                            content="Продолжайте работу с результатом в личном кабинете."
                            action={{ label: 'Перейти в сервис' }}
                        >
                            <Input variant="white" format="phone" placeholder="+7 900 000-00-00" />
                            <Input variant="white" placeholder="Имя" />
                            <Button type="submit">Отправить</Button>
                        </PromoPageCta>
                    </div>
                </div>
            </section>
            <section className="component-screen">
                <h1 className="component-screen__title ts-600-2xl">Promo Page Steps</h1>
                <div className="preview-grid preview-grid--inspector" style={{ overflowX: 'auto' }}>
                    <div className="preview-controls">
                        <div className="preview-cell-switches">
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Tag</span>
                                <Switch
                                    label="Step tag"
                                    isSelected={isPromoStepsTagVisible}
                                    onChange={setIsPromoStepsTagVisible}
                                />
                            </div>
                            <div className="preview-cell-switches__item">
                                <span className="ts-500-m">Left content</span>
                                <Switch
                                    label="Step left content"
                                    isSelected={isPromoStepsContentVisible}
                                    onChange={setIsPromoStepsContentVisible}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="preview-stage">
                        <PromoPageSteps
                            title="Как это работает"
                            hasTitle
                            steps={[1, 2, 3].map((step) => ({
                                tag: isPromoStepsTagVisible ? undefined : false,
                                title: `Название шага ${step}`,
                                description: 'Описание шага с дополнительной информацией для пользователя.',
                                leftContent: isPromoStepsContentVisible
                                    ? <Button size="s" isHugWidth>Дополнительное действие</Button>
                                    : undefined,
                                image: (
                                    <div
                                        style={{
                                            flex: 1,
                                            background: 'var(--marketing-teal-2-fixed)',
                                        }}
                                        aria-hidden="true"
                                    />
                                ),
                            }))}
                        />
                    </div>
                </div>
            </section>
            <section className="component-screen">
                <h1 className="component-screen__title ts-600-2xl">Input — новые props</h1>
                <div className="preview-stage">
                    <Input
                        label="Пароль"
                        type="password"
                        variant="white"
                        value={passwordValue}
                        onChange={setPasswordValue}
                        placeholder="Введите пароль"
                    />
                    <Input
                        label="Телефон"
                        format="phone"
                        variant="white"
                        value={phoneValue}
                        onChange={setPhoneValue}
                        placeholder="+7 900 000-00-00"
                    />
                </div>
            </section>
        </div>
    );
};
