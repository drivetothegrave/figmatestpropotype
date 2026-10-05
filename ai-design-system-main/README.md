# T Design System

React компонент-библиотека для T Design System.

## Установка

### Требования
- React 16.8+
- React DOM 16.8+

Пакет публикуется одновременно в GitHub Packages и GitLab Package Registry. Перед установкой выбери registry и настрой scope `@pluginwoman`. Для внутренних проектов Точки рекомендуется GitLab Package Registry.

Для установки приватного пакета понадобится токен с правом чтения package registry. Настрой его один раз в глобальном пользовательском файле `~/.npmrc` — ниже указано, для какого registry и URL это нужно сделать.

> **Важно:** не добавляй токены в Git и не вставляй их непосредственно в команды или URL.

#### GitHub Packages

Для установки из GitHub Packages заранее запроси доступ к пакету у Екатерины Никитиной (`@nikitina_e` в Connect).

```bash
npm config set @pluginwoman:registry https://npm.pkg.github.com --location=project
npm install @pluginwoman/t-ds
```

Для приватного GitHub Packages токен должен находиться в глобальном пользовательском файле `~/.npmrc` или в CI-конфиге npm, а не в репозитории:

```ini
//npm.pkg.github.com/:_authToken=ваш токен
```

#### GitLab Package Registry

Используй project-scoped registry проекта `ai-design-system`:

Для доступа к приватному пакету нужен Personal Access Token или Project Access Token с правом `read_package_registry`.  Глобальный `~/.npmrc` должен содержать токен для того же project-scoped URL:

```ini
//gitlab.tochka-tech.com/api/v4/projects/13170/packages/npm/:_authToken=ваш токен
```

В проектном `.npmrc` должна находиться только настройка registry для scope `@pluginwoman`:

```ini
@pluginwoman:registry=https://gitlab.tochka-tech.com/api/v4/projects/13170/packages/npm/
```

Настрой registry в проектном `.npmrc`, затем установи пакет:

```bash
npm config set @pluginwoman:registry https://gitlab.tochka-tech.com/api/v4/projects/13170/packages/npm/ --location=project
npm install @pluginwoman/t-ds
```

### Установка через ИИ-агента (Claude Code, Cursor и др.)

Для установки и проверки подключения можно использовать skill `dt-project-workflow` из набора skills. Он описывает настройку registry, установку `@pluginwoman/t-ds`, подключение стилей, подготовку vendor-копии и проверку проекта.

Либо можно использовать ручные промты:
1. Для подключения T Design System к новому проекту 

```
Подключи T Design System (@pluginwoman/t-ds) к этому проекту:

1. Выбери registry. Для внутреннего проекта Точки добавь в .npmrc строку:
   @pluginwoman:registry=https://gitlab.tochka-tech.com/api/v4/projects/13170/packages/npm/
2. Установи пакет: npm install @pluginwoman/t-ds
3. Подключи стили один раз в корневом файле (App.tsx / main.tsx / layout.tsx):
   import '@pluginwoman/t-ds/style.css'
4. Добавь CSS-reset для корректного рендеринга шрифта в html или :root:
   -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
5. Прочитай AGENTS.md из репозитория @pluginwoman/t-ds — там полный каталог
   компонентов, дизайн-токены и правила применения.

После подлючения прочитай файл AGENTS.md с инструкциями по использованию дизайн системы
```
2. Для обновления
Система постоянно дорабатывается: появляются новые компоненты, правятся баги, чтобы это все подтянулось в ваш проект нужно обновиться до последней версии.

```
Обнови дизайн систему t-ds в проекте до последней версии, перед обновлением проверь что нет ломающих изменений, если они есть предложи решение.
```

## Использование

### Подключение стилей

Подключи стили библиотеки один раз в корневом файле приложения:

```tsx
import '@pluginwoman/t-ds/style.css'
```

Пакет поставляется с CSS-переменными для цветов, типографики, отступов, скруглений, теней и иконок.

### Импорт компонентов

```tsx
import { Badge, Button, Input, Switch } from '@pluginwoman/t-ds'
import { Circle } from '@pluginwoman/t-ds/icons'
import '@pluginwoman/t-ds/style.css'

export function App() {
  return (
    <>
      <Button variant="primary">Нажми меня</Button>
      <Input placeholder="Введи текст" />
      <Switch />
      <Badge value={3} />
      <Circle />
    </>
  )
}
```

### Публичные entrypoints

- `@pluginwoman/t-ds` — компоненты библиотеки
- `@pluginwoman/t-ds/icons` — SVG-иконки
- `@pluginwoman/t-ds/style.css` — общие стили библиотеки (алиас `@pluginwoman/t-ds/style` сохранён для обратной совместимости)

### Иконки

Для большинства случаев используй barrel `@pluginwoman/t-ds/icons`:

```tsx
import { Circle, ChevronRight, Checkmark } from '@pluginwoman/t-ds/icons'
```

Если нужен конкретный размер или вариант начертания, используй соответствующий subpath:

```tsx
import { InformationCircle } from '@pluginwoman/t-ds/icons/20/Filled'
import { Acquiring, QRCode } from '@pluginwoman/t-ds/icons/24/Filled'
import { QuestionCircle, KonturTalk } from '@pluginwoman/t-ds/icons/20/Stroked1px'
```

Доступны subpath-экспорты `12/Filled`, `16/Filled`, `16/Stroked`, `20/Filled`, `20/Stroked`, `20/Stroked1px`, `24/Filled`, `24/Stroked`, `32/Filled` и `32/Stroked`.

### Гайд для ИИ-агентов

В корне репозитория лежит [`AGENTS.md`](./AGENTS.md) — инструкция по применению дизайн-системы для ИИ-агентов (Claude Code, Cursor и др.). Файл описывает базовые правила, дизайн-токены (цвет, типографика, отступы, скругления, тени, иконки), каталог всех компонентов с ключевыми пропсами, типовые рецепты и чеклист перед сдачей UI. Большинство агентов подхватывают `AGENTS.md` автоматически; при сборке интерфейсов из этой библиотеки опирайся на него.

### Доступные компоненты

- **AccordeonCell** — ячейка с раскрывающимся содержимым
- **ActionFormCell** — ячейка формы с действием
- **ActionSheet** — нижняя панель действий
- **ActionSheetButton** — кнопка действия внутри ActionSheet
- **ActionSheetFooter** — подвал ActionSheet с кнопкой отмены
- **ActionSheetHeader** — заголовок ActionSheet
- **Alert** — короткое текстовое уведомление (success, error, neutral)
- **Avatar** — аватар пользователя
- **AvatarCheckbox** — аватар с состоянием выбора
- **Badge** — бейдж количества
- **BottomSheet** — нижняя панель с контентом и поиском
- **BottomSheetHeader** — заголовок BottomSheet с действиями
- **BottomSheetSearch** — поиск внутри BottomSheet
- **Button** — кнопка с вариантами (primary, secondary, transparent, white)
- **Cell** — базовая ячейка списка
- **CellLeftAccessory** — левый аксессуар ячейки
- **CellRightAccessory** — правый аксессуар ячейки
- **Checkbox** — чекбокс
- **Chip** — чип/тег с опциональной иконкой
- **ContextMenu** — контекстное меню
- **ContextualNotification** — контекстное уведомление с иконкой, действием и кнопкой закрытия
- **Drawer** — выезжающая панель
- **DrawerFooter** — подвал Drawer с действиями
- **DrawerHeader** — заголовок Drawer
- **DrawerHeaderTitle** — заголовок содержимого Drawer
- **Dropdown** — выпадающий список
- **FeedbackBanner** — баннер обратной связи
- **Footer** — фиксированный подвал страницы с кнопками действий
- **FooterIconButton** — иконочная кнопка в Footer
- **FormCell** — ячейка формы со свитчером, чекбоксом или радио
- **FlowResultView** — экран результата флоу (успех / ошибка / ожидание), используется внутри Modal/Drawer
- **HeaderButton** — кнопка или группа кнопок под заголовком страницы
- **IconButton** — квадратная кнопка с иконкой
- **Input** — текстовое поле ввода
- **LinearProgress** — линейный индикатор прогресса
- **LinkCell** — ячейка-ссылка с заголовком, описанием и индикатором загрузки
- **MainPageNavigationBar** — главная навигационная панель сайта
- **Modal** — модальное окно
- **ModalFooter** — подвал Modal с действиями
- **ModalHeader** — заголовок Modal
- **NavigationBar** — навигационная панель страницы с заголовком
- **PageAction** — строка действия или перехода на странице
- **PageLayout** — базовый макет страницы с навигацией и опциональной правой панелью
- **PromoPageBanner** — крупный визуальный блок-шапка для промо-страниц
- **PromoPageCard** — карточка для контентного наполнения промо-страниц
- **PromoPageCta** — CTA-блок промо-страницы с формой, текстовым действием и success-состоянием
- **PromoPageHorizontalCard** — горизонтальная карточка на всю ширину для промо-страниц
- **PromoPageSteps** — последовательность шагов промо-страницы
- **PromoPageTitle** — адаптивный заголовок промо-страницы
- **Radio** — радиокнопка для единичного выбора
- **SCINavigationButton** — кнопка раздела в MainPageNavigationBar
- **Spinner** — анимированный индикатор загрузки
- **Stepper** — управление числовым значением с кнопками увеличения и уменьшения
- **Switch** — переключатель между двумя состояниями
- **Search** — поле поиска
- **Table** — грид-обёртка для таблицы из ячеек
- **TableCell** — ячейка таблицы с заголовком, описанием, тегом и аксессуарами
- **TabsCarousel** — горизонтальный скроллируемый список табов с анимацией переключения и поддержкой бейджей
- **Tag** — метка статуса или категории
- **TextArea** — многострочное поле ввода
- **Tooltip** — всплывающая подсказка
- **Widget** — блок-контейнер с заголовком и зоной для контента
- **WidgetTitle** — шапка виджета с заголовком и правым аксессуаром
- **WidgetTitleAccessory** — правый аксессуар заголовка Widget

## Лицензия

MIT — используй как хочешь в своих проектах
