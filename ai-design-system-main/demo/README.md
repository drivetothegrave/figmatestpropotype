# Demo Preview Guide

Инструкция по добавлению и поддержке превью в папке `demo`.

## Структура

- `App.tsx` — корневой переключатель вкладок демо.
- `App.css` — общие layout-классы и стили страницы демо.
- `index.css` — базовые стили страницы и общие стили для `range-slider`.
- `preview/StylesPreview.tsx` — превью токенов и типографики.
- `preview/IconsPreview.tsx` — превью иконок.
- `preview/AtomsPreview.tsx` — превью атомов.
- `preview/ComponentsPreview.tsx` — превью составных компонентов.

## Как добавить новое превью

1. Создай или обнови нужный файл в `demo/preview`.
2. Экспортируй React-компонент превью.
3. Подключи его в `demo/App.tsx`.
4. Добавь кнопку вкладки в `tab-nav`, если это новая отдельная категория.
5. Переиспользуй существующие demo-классы из `App.css`.
6. Проверь отображение в `npm run dev`.
7. Прогони `npm run type-check`.

## Базовый шаблон секции

```tsx
{/* Матрица вариаций: лейбл + 3 колонки */}
<section className="component-screen">
  <div className="preview-grid preview-grid--matrix">
    <h1 className="component-screen__title ts-600-2xl">Component Name</h1>
    <div className="preview-grid__header ts-500-m">Variant A</div>
    <div className="preview-grid__header ts-500-m">Variant B</div>
    <div className="preview-grid__header ts-500-m">Variant C</div>

    <div className="preview-grid__label ts-500-m">Default</div>
    <ComponentA />
    <ComponentB />
    <ComponentC />
  </div>
</section>

{/* Инспектор: панель контролов + компонент */}
<section className="component-screen">
  <h1 className="component-screen__title ts-600-2xl">Component Name</h1>
  <div className="preview-grid preview-grid--inspector">
    <div className="preview-controls">...</div>
    <div className="preview-stage">
      <MyComponent />
    </div>
  </div>
</section>
```

## Что переиспользовать в первую очередь

### Общие блоки

- `component-screen` — базовая карточка секции.
- `component-screen--flex` — секция с несколькими колонками рядом.
- `preview-grid` — базовая сетка для превью.
- `preview-grid__header` — заголовки колонок.
- `preview-grid__label` — подписи строк.

### Модификаторы сеток

Два паттерна на все случаи:

**`preview-grid--matrix`** — матрица вариаций: лейбл-колонка + N контентных колонок.  
Настраивается CSS-переменными (дефолты: `--label-w: 80px`, `--cols: 3`, `--col-w: max-content`):

```tsx
{/* 4 авто-колонки */}
<div className="preview-grid preview-grid--matrix" style={{ '--cols': 4 } as CSSProperties}>

{/* 2 широкие колонки */}
<div className="preview-grid preview-grid--matrix" style={{ '--label-w': '120px', '--cols': 2, '--col-w': '335px' } as CSSProperties}>

{/* Fluid-колонки */}
<div className="preview-grid preview-grid--matrix" style={{ '--cols': 3, '--col-w': 'minmax(0, 1fr)' } as CSSProperties}>
```

**`preview-grid--inspector`** — панель контролов слева (`320px`) + компонент справа (`1fr`, центрирован):

```tsx
<div className="preview-grid preview-grid--inspector">
  <div className="preview-controls">...</div>
  <div className="preview-stage">
    <MyComponent />
  </div>
</div>
```

### Повторяющиеся паттерны

- `preview-control-stack` — вертикальный стек для интерактивного демо.
- `preview-control-stack__bar` — контейнер фиксированной ширины под bar/control preview.
- `preview-control-row` — строка с подписью и контролом.
- `preview-control-row__fill` — элемент, который должен занимать оставшуюся ширину.
- `preview-stack-group` — вертикальная группа элементов на всю ширину.

### Токены и иконки

- `token-grid`, `token-grid--compact`, `token-grid--regular`
- `token-card`
- `token-section-list`, `token-section`, `token-section__title`
- `icons-preview__grid`, `icons-preview__grid--compact`
- `icons-preview__card`, `icons-preview__icon`, `icons-preview__label`

## Когда можно использовать inline styles

Инлайн-стили допустимы, если:

- значение реально динамическое и приходит из данных;
- нужен CSS custom property на конкретном инстансе;
- это токен-превью, где стиль напрямую демонстрирует значение токена;
- без инлайна придётся создавать одноразовый класс ради одного свойства.

## Когда лучше добавить класс в `App.css`

Добавляй класс, если:

- паттерн встречается в двух и более местах;
- это layout, а не данные;
- стиль описывает структуру блока, а не содержимое;
- название класса будет понятно и переиспользуемо в других превью.

## Принципы поддержки

- Сначала переиспользуй существующие `preview-*`, `token-*`, `icons-preview-*` классы.
- Не делай рефакторинг ради рефакторинга: визуал должен оставаться близким к текущему.
- Если есть выбор между "идеально абстрактно" и "понятно локально", выбирай понятность.
- Не выноси динамические значения в классы, если от этого код становится сложнее.
- Новые модификаторы именуй по паттерну: базовый класс + понятный суффикс.

## Проверка перед завершением

- превью открывается в правильной вкладке;
- сетка не поехала на текущих брейкпоинтах;
- отступы соответствуют соседним секциям;
- нет лишних одноразовых layout-инлайнов;
- `npm run type-check` проходит без ошибок.
