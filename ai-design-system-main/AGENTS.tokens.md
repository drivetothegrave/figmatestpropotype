## 2. Дизайн-токены

Этот гайд описывает токены t-ds и правила их применения при сборке интерфейсов. Используй семантически подходящие токены вместо произвольных значений. В репозитории сверяй определения с `src/assets/Style/`, в установленном пакете — с CSS из `@pluginwoman/t-ds/style.css`.

Токены доступны как CSS-переменные в `:root`; исходные определения лежат в `src/assets/Style/`. Применяй их в кастомном CSS, в пропсах вида `color` / `backgroundColor` и в инлайн-`style`.

В проектах на **Tailwind (v4)** предпочитай arbitrary-value классы вместо инлайн-`style` — так токен проходит через утилиты Tailwind и не плодит инлайновые стили:

```tsx
// предпочтительно (Tailwind v4)
<p className="text-[var(--primitive-primary)] bg-[var(--bg-brand-1)]">…</p>
// эквивалент через style
<p style={{ color: 'var(--primitive-primary)', background: 'var(--bg-brand-1)' }}>…</p>
```

### 2.1 Цвет (`color.css`)
Группы переменных (используй по семантике, не по конкретному hex):

| Группа | Префикс | Назначение |
|---|---|---|
| Примитивы | `--primitive-*` | базовая палитра: `primary` (#191919 — основной текст), `secondary` (вторичный текст), `neutral-1…4`, `default` (белый), `brand`, `error`, `success`, `warning`, `warning-dark` |
| Фоны | `--bg-*` | фоны поверхностей и статусов с тональными шкалами `1…5` (`--bg-brand-1` … `--bg-brand-5`, аналогично error/success/warning) |
| Контейнеры | `--container-default`, `--container-transparent-1/2` (+ `-inverse`) | заливки карточек и полупрозрачных слоёв |
| Страница / попап | `--page-primary/secondary`, `--popup-primary/secondary` | фоны страницы и всплывающих слоёв |
| Оверлеи | `--overlay-popup`, `--overlay-primary-alpha-050` | затемнение под модалками/шитами |
| Категорийные | `--category-sand … --category-emerald` | 10 цветов для аватаров/категорий |
| Полупрозрачные | `--translucent-primitives-*` | текст/иконки поверх изображений |
| Состояния | `--state-*-active` | цвет активного (pressed) состояния |

Правило: текст — `--primitive-primary` / `--primitive-secondary`; для текста со статусом `Warning` используй `--primitive-warning-dark`; статусные акценты на фонах — `--bg-error/success/warning/brand`; фоны блоков — `--bg-neutral-*` или `--container-*`.

### 2.2 Типографика (`font.css`)
Шрифт — **TT Norms Tochka Extended** (подключается автоматически). Применяется **классами**, а не переменными. Формат: `ts-{вес}-{размер}`.

- Веса: `400` (Regular), `500` (Medium), `600` (DemiBold).
- Размеры: `7xl 60` · `6xl 48` · `5xl 42` · `4xl 36` · `3xl 30` · `2xl 24` · `xl 20` · `l 18` · `m 16` · `s 14` · `xs 12` · `xxs 10` (px).
- Примеры: `ts-600-2xl` (заголовок 24/600), `ts-500-l` (текст кнопки 18/500), `ts-400-s` (описание 14/400).

```tsx
<p className="ts-500-m">Заголовок ячейки</p>
<span className="ts-400-s">Подпись</span>
```
Многие компоненты принимают типографический класс пропсом (`Cell.titleClassName`, `descriptionClassName` и т.п.).

### 2.3 Отступы (`spacing.css`)
Шкала `--spacing-{n}x`, базовый шаг 4px: `0-5x`=2 · `1x`=4 · `1-5x`=6 · `2x`=8 · `2-5x`=10 · `3x`=12 · `3-5x`=14 · `4x`=16 · `4-5x`=18 · `5x`=20 · `6x`=24 · `7x`=28 · `7-5x`=30 · `8x`=32 · `10x`=40 · `12x`=48 · `14x`=56 · `16x`=64 · `20x`=80 · `24x`=96 · `30x`=120 · `40x`=160.

Семантические алиасы для раскладки страницы:
- `--page-top-padding` / `--page-bottom-padding` (32px), `--page-bottom-padding-with-chat` (64px), `--page-horizontal-padding` (20px).
- Отступы между блоками контента: `--content-section-list-spacing` (48px, между секциями), `--content-group-list-spacing` (32px, между группами), `--content-element-list-spacing` (16px, между элементами).

### 2.4 Скругления (`radius.css`)
Шкала `--rounding-{n}x` (2…96px) + `--rounding-pill` (999px). Предпочитай **семантические** алиасы, а не сырые значения:
`--button-rounding-strong/weak`, `--cell-rounding-strong/weak`, `--chip-rounding-*`, `--card-rounding`, `--form-rounding(-weak)`, `--popup-rounding-*`, `--checkbox-rounding`, `--tag-rounding(-strong/-weak)`, `--slider-rounding`.

### 2.5 Тени (`shadow.css`)
Готовые тени-переменные по назначению:
- Поверхности: `--Raised`, `--Card`, `--Popout`, `--Floating`, `--Brand`, `--Popup-Inverse`, `--Drawer-Left/Right`.
- Состояния: `--Hovered`, `--Pressed`.
- Sticky: `--Sticky-Left`, `--Sticky-Top`.
- Бордеры (через inset-тень): `--Top-Line`, `--Bottom-Line`, `--Left-Line`, `--Right-Line`.
