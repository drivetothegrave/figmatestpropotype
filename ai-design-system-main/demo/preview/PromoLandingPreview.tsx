import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Footer,
    Input,
    PromoPageBanner,
    PromoPageCard,
    PromoPageCta,
    PromoPageHorizontalCard,
    PromoPageSteps,
    PromoPageTitle,
    useScrollTo,
} from '../../src';
import { Circle } from '../../src/assets/Icon/32/Filled';
import './PromoLandingPreview.css';

const PromoLandingPreview: React.FC = () => {
    const [isCtaSuccess, setIsCtaSuccess] = useState(false);
    const [phone, setPhone] = useState('');
    const [heroPassed, setHeroPassed] = useState(false);
    const [ctaVisible, setCtaVisible] = useState(false);
    const [isScrollingToCta, setIsScrollingToCta] = useState(false);
    const ctaSentinelRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLElement>(null);
    const scrollToCta = useScrollTo(ctaRef);
    const handleScrollToCta = () => {
        setIsScrollingToCta(true);
        scrollToCta();
    };

    useEffect(() => {
        document.body.classList.add('promo-page-body');

        return () => document.body.classList.remove('promo-page-body');
    }, []);

    useEffect(() => {
        const heroButton = document.querySelector('.promo-page-banner__button');
        if (!heroButton) return undefined;

        const observer = new IntersectionObserver(([entry]) => {
            setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
        }, { threshold: 0 });

        observer.observe(heroButton);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const ctaSentinel = ctaSentinelRef.current;
        if (!ctaSentinel) return undefined;

        const observer = new IntersectionObserver(([entry]) => {
            setCtaVisible(entry.isIntersecting);
        }, { threshold: 0 });

        observer.observe(ctaSentinel);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isScrollingToCta) return undefined;

        const stopScrolling = () => setIsScrollingToCta(false);
        const fallbackTimeout = window.setTimeout(stopScrolling, 1000);

        window.addEventListener('scrollend', stopScrolling);
        return () => {
            window.removeEventListener('scrollend', stopScrolling);
            window.clearTimeout(fallbackTimeout);
        };
    }, [isScrollingToCta]);

    const isStickyFooterVisible = heroPassed && !ctaVisible && !isScrollingToCta;

    return (
        <>
        <main className="promo-page">
            <PromoPageBanner
                className="promo-page__banner"
                title="Соберите свой сценарий"
                description="Выберите подходящее решение и получите понятный план следующих шагов"
                buttonLabel="Начать"
                imageObjectFit="cover"
                imageObjectPosition="center"
                onButtonClick={handleScrollToCta}
                hasAib
                aibItems={[
                    {
                        icon: <Circle />,
                        title: 'Подберите решение под задачу',
                        description: 'Ответьте на несколько вопросов',
                    },
                    {
                        icon: <Circle />,
                        title: 'Получите понятный план действий',
                        description: 'Без лишней сложности',
                    },
                    {
                        icon: <Circle />,
                        title: 'Сохраните результат',
                        description: 'Вернитесь к сценарию в удобное время',
                    },
                ]}
                hasAibIcons
                hasAibDescriptions
            />

            <div className="promo-page__content">
            <section className="promo-page__section">
                <PromoPageTitle>Возможности сервиса</PromoPageTitle>
                <div className="promo-page__cards-stack">
                    <div className="promo-page__cards">
                        <PromoPageCard
                            title="Быстрый старт"
                            description="Заполните несколько полей и сразу получите предварительный результат."
                        />
                        <PromoPageCard
                            title="Понятные шаги"
                            description="Движение к цели разбито на последовательные действия без лишней сложности."
                        />
                        <PromoPageCard
                            title="Поддержка на каждом этапе"
                            description="Сохраняйте результат и возвращайтесь к нему в удобное время."
                        />
                    </div>
                    <PromoPageCard
                        isHorizontal
                        title="Все ключевые данные в одном месте"
                        description="Соберите информацию, сравните варианты и выберите подходящий сценарий."
                    />
                </div>
            </section>

            <section className="promo-page__section">
                <PromoPageTitle>Почему это удобно</PromoPageTitle>
                <PromoPageHorizontalCard
                    title="Решение под ваши задачи"
                    description="Используйте готовый сценарий как основу и адаптируйте его под свою ситуацию."
                    variant="default"
                />
            </section>

            <section className="promo-page__section">
                <div className="section-info">
                    <PromoPageTitle>Как это работает</PromoPageTitle>
                    <p className="promo-page__section-text ts-400-l">
                        Два простых шага, чтобы перейти от задачи к готовому решению.
                    </p>
                </div>
                <PromoPageSteps
                    hasTitle={false}
                    steps={[
                        {
                            title: 'Опишите задачу',
                            description: 'Ответьте на несколько вопросов, чтобы мы поняли вашу ситуацию.',
                            image: <span className="promo-page__image-placeholder" aria-hidden="true" />,
                        },
                        {
                            title: 'Получите результат',
                            description: 'Изучите рекомендации и выберите следующий шаг.',
                            image: <span className="promo-page__image-placeholder" aria-hidden="true" />,
                        },
                    ]}
                />
            </section>

            <section className="promo-page__section">
                <PromoPageTitle>Готовы начать?</PromoPageTitle>
                <PromoPageHorizontalCard
                    title="Сделайте первый шаг уже сейчас"
                    description="Запустите сценарий и получите результат, который можно использовать дальше."
                    buttonLabel="Начать"
                    variant="accent"
                />
            </section>

            </div>

            <section ref={ctaRef} className="promo-page__section promo-page__section--cta">
                <div ref={ctaSentinelRef} className="promo-page__cta-sentinel" aria-hidden="true" />
                <PromoPageCta
                    title="Проверьте предложение"
                    description="Заполните данные, чтобы получить результат"
                    isSuccess={isCtaSuccess}
                    successTitle="Получили вашу заявку"
                    successDescription="Перезвоним в течение рабочего дня, чтобы уточнить все детали"
                    successAction={{ label: 'Вернуться к форме', onClick: () => setIsCtaSuccess(false) }}
                    successImageSrc="/assets/shared/cta-success.png"
                    successImageAlt="Человек ловит бумажный самолётик у футбольных ворот"
                >
                    <Input
                        variant="white"
                        format="phone"
                        placeholder="+7 900 000-00-00"
                        value={phone}
                        onChange={setPhone}
                    />
                    <Input variant="white" placeholder="Имя" />
                    <Button type="button" onClick={() => setIsCtaSuccess(true)}>Отправить</Button>
                </PromoPageCta>
            </section>
        </main>
        <Footer
            isVisible={isStickyFooterVisible}
            primaryAction={{ label: 'Начать', onClick: handleScrollToCta }}
        />
        </>
    );
};

export default PromoLandingPreview;
