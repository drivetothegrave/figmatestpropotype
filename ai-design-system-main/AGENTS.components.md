## 3. Каталог компонентов

Этот гайд — каталог компонентов t-ds и ключевых правил их применения. В репозитории API сверяй с `src/components/`; в проекте с установленной библиотекой — с её `.d.ts`. Не создавай аналоги готовых компонентов.

Группы ниже — для навигации. Для каждого компонента указаны назначение, ключевые пропсы и правила. Доступность `className`, состояния и колбэки зависит от компонента.

### 3.1 Действия и кнопки
- **`Button`** — основное действие. `variant` `primary` (по умолч.) / `secondary` / `transparent` / `white`; `size` `xl/l/m/s/xs` (дефолт `m`); `isHugWidth` (ширина по содержимому вместо фиксированной); `leftAccessory`/`rightAccessory` (иконки по бокам от текста); `isLoading`, `isDisabled`, `type`, `onClick`. Текст — обязательный `children`.

- **`IconButton`** — квадратная кнопка с одной иконкой без текста. `icon` (обязательный, голый `ReactNode` — компонент оборачивает сам), `ariaLabel` (обязательный), `variant` `primary/secondary/transparent/white`; `size` `xl/l/m/s/xs` (дефолт `m`); `isLoading`, `isDisabled`, `onClick`.
  > Не используй `Button` с `leftAccessory` без `children` — для иконочных кнопок всегда `IconButton`.
- **`HeaderButton`** — кнопка в начале экрана или сразу под заголовком. `variant` `primary/secondary/danger`; `icon`; `isLoading`, `isDisabled`.
- **`PageAction`** — крупный элемент действия/перехода на странице, обычно располагается внизу страницы или в 3 колонке. `title`, `description`, `leftAccessory` (иконка из набора 32px, импорт из `@pluginwoman/t-ds/icons/32/Stroked`), `variant` `default/danger`, `onClick`, `isDisabled`.
- **`Chip`** — компактный выбор/фильтр, часто применяется в фильтрах. `variant` `chip` (множественный выбор) / `tab` (переключение контента, поддерживает `badge`) / `dropdown` (фильтр со встроенным попапом: `popupContent`, `hasSearch`, `value`, `isLoading`, `isEmpty`) / `action` (действие с `onClose`). `isSelected`, `leftAccessory` `icon/logo/logo-stack`. Обычно используется группой.
- **`AvatarCheckbox`** — компактный контрол выбора с состояниями checked/disabled. `size` `m/s`, `isChecked`, `isDisabled`, `onClick`.

### 3.2 Формы и ввод
- **`Input`** — однострочное текстовое поле. `label`, `description`, `errorMessage` + `isError`, `placeholder`, `type` (`text/password/email/tel/url`), `variant` (`default/white`), controlled `value`/`onChange`, `left`/`right` слоты, `hasHelpIcon`+`helpText`, `format` (`number/currency/percent/phone`). Для `format="phone"` наружу передаётся нормализованное значение в формате `+7 ...`.
- **`TextArea`** — многострочное, автоувеличение. То же + `maxLength` (включает счётчик).
- **`Search`** — поле поиска с иконкой и очисткой. `value`, `onChange`, `placeholder`, `className`.
- **`Dropdown`** — выбор из списка. controlled `value`/`onChange`, `children` — обычно `Cell`; `placeholder`, `isError`/`errorMessage`, `hasSearch`, `isLoading`, `isEmpty`, `hasHelpIcon`/`helpText`, `right` слот. Сценарий сборки компонента и списка опций через `Cell` — в скилле `$dt-ui-builder`. Перед реализацией сверяй props с `.d.ts` установленной версии пакета.
- **`Checkbox`** — `isChecked`, `isIndeterminate`, `isDisabled`, `onChange(checked)`, `label` (aria).
- **`Radio`** — единичный выбор в группе. `isSelected`, `onChange`, `isDisabled`, `label`.
- **`Switch`** — переключатель двух состояний. `isSelected`, `onChange(isSelected)`, `isDisabled`, `label`.
- **`FormCell`** — строка формы с управляющим элементом справа. `title`, `subtitle`, `description`, `left` (Avatar), `right` (`Switch`/`Checkbox`/`Radio`), `variant` `single/stack-top/stack-middle/stack-bottom` (для группировки в стек), `children`.
- **`ActionFormCell`** — интерактивная строка-действие в форме/списке. `title`, `description`, `left` (иконка 24), `right` (спиннер), `variant` (как у FormCell), `onClick`, `isDisabled`. Сценарий сборки компонента — в скилле `$dt-ui-builder`.

> Группировка ячеек в «карточку»: используй `variant="stack-top" | "stack-middle" | "stack-bottom"` для крайних и средних элементов, `single` — для одиночной.

### 3.3 Ячейки и списки
- **`Cell`** — универсальная строка списка. `title`, `subtitle`, `description`, `leftAccessory`/`rightAccessory` (любой `ReactNode`; слот рендерится только при наличии пропа), `verticalPadding` `none/2x/3x/4x`, типографика и цвета пропсами (`titleClassName`, `titleColor`, …), `onClick` (делает строку интерактивной).
- **`LinkCell`** — ячейка-ссылка с заголовком, описанием и индикатором загрузки. `title`, `description`, `isLoading`, `onClick`.
- **`CellLeftAccessory`** — готовые левые аксессуары. `variant`: `avatar` / `icon-30` / `icon-24` / `icon-18` / `card-preview` / `avatar-checkbox` / `add-button` / `custom`. `icon`, `avatarLabel`, `isChecked`, `onClick`.
- **`CellRightAccessory`** — готовые правые аксессуары (большой набор `variant`: текстовые `text-l/m/s`, иконочные, `checkbox`/`radio`/`switch`, `disclosure`, `badge`, `stepper`, `spinner-*`, составные `text-m-icon-*`, табличные `table-text-*` и др.). `text`, `secondaryText`, `icon`, `value`, `isChecked`/`onCheckedChange`, `onStep`.

Аксессуары Cell подключаются тремя способами:
```tsx
// 1. Выключить — не передавать проп
<Cell title="Без аксессуара" />

// 2. Пресет из DS
<Cell
  leftAccessory={<CellLeftAccessory variant="avatar" avatarLabel="AB" />}
  rightAccessory={<CellRightAccessory variant="disclosure" />}
/>

// 3. Кастомный компонент
<Cell
  leftAccessory={<Avatar imageUrl="..." size="m" />}
  rightAccessory={<Switch isSelected onChange={handleChange} />}
/>
```
- **`AccordeonCell`** — раскрываемая секция. `title`, `description`, `children` (контент), `size` `xl/2xl`, `chevronPosition` `title/edge`, controlled `isOpen`/`onOpenChange` или `defaultOpen`, `contentSpacing`/`listSpacing` (`0/0-5x/1x/2x/4x/6x`), правый аксессуар.

> Предпочитай `CellLeftAccessory` / `CellRightAccessory` ручной вёрстке аксессуаров в `Cell`.

### 3.4 Таблицы
- **`Table`** — грид-обёртка. `columns` (число колонок) или `gridTemplateColumns` (CSS, имеет приоритет), `children` — `TableCell`.
- **`TableCell`** — ячейка таблицы. `title`, `hasDescription`/`description`, `hasTag`/`tag`, `hasLeftAccessory`/`leftAccessory` (Avatar/Icon 24), `hasRightAccessory`/`rightAccessory`, `titleStyle` `400/500/600`, `isEdit` (title как input: `placeholder`, `onTitleChange`), `isError` (правый слот → иконка Info), `isDisabled`, `backgroundColor`, `onClick`.

### 3.5 Статусы, бейджи, индикаторы
- **`Tag`** — метка/статус. `shape` `circle/square`, `variant` `filled/outlined`, `size` `xl/l/m/s`.
- **`Badge`** — счётчик/индикатор. `value` (число; `>99` → `99+`), `size` `m/s/xs`, кастом `color`/`textColor`.
- **`Spinner`** — индикатор загрузки. Кастомизация через `style` (размер/цвет).
- **`LinearProgress`** — линейный прогресс. `variant` `percent` (value 0–100) / `steps` (value = выполнено, `maxSteps`), `progressColor`/`trackColor`.
- **`Avatar`** — изображение/иконка/инициалы. Приоритет: `imageUrl` → `icon` → `label`. `size` (`2xl…2xs` или число 16–120), `shape` `circle/superellipse/square`.

### 3.6 Уведомления и фидбек
- **`Alert`** — короткое текстовое уведомление. `type` `success/error/neutral`, `textAlign` `left/center`, текст — `children`.
- **`ContextualNotification`** — компактный блок с иконкой/аватаром, заголовком, действием и крестиком. `text`, `title`/`hasTitle`, `accessory` `icon/avatar` (+ `icon`/`avatar`), `hasAction`/`actionLabel`/`onActionClick`, `hasSpinner`, `hasCloseIcon`/`onClose`, `size` `s/m`. Для пропа `icon` используй иконки из набора 20px.
- **`FeedbackBanner`** — сбор обратной связи, по клику открывается модалка, обычно располагается внизу страницы `children` (текст), `primaryAction`/`secondaryAction` (`{label, onClick, isDisabled}`).
- **`Tooltip`** — подсказка по наведению/фокусу. `trigger`, `children` (контент), `placement` `right/left`, controlled `isOpen`/`onOpenChange` или `defaultOpen`.

### 3.7 Оверлеи (составные)
- **`Modal`** (+ `ModalHeader`, `ModalFooter`) — окно с затемнением. `Modal`: `isOpen`, `onClose`, `header`, `footer`, `children`, `isOverlayCloseEnabled`. `ModalHeader`: `title`, `leftAccessory`/`hasDefaultBackArrow`/`onLeftAccessoryClick`, `onClose`. `ModalFooter`: `layout` `1-button/2-buttons/2-horizontal-buttons/empty`, `primaryAction`/`secondaryAction`, `description`.
- **`Drawer`** (+ `DrawerHeader`, `DrawerHeaderTitle`, `DrawerFooter`) — боковая панель. Аналогично Modal; `DrawerHeader.titleVariant` `text-m/text-l`; `DrawerFooter.layout` `1-button/2-buttons/2-horizontal-buttons/empty`.
- **`ActionSheet`** (+ `ActionSheetHeader`, `ActionSheetButton`, `ActionSheetFooter`) — нижняя панель действий. `ActionSheet`: `isOpen`, `onClose`, `header`, `children` (кнопки), `footer`, `isOverlayCloseEnabled`. `ActionSheetButton`: `title`, `description`/`hasDescription`, `icon`/`hasIcon`, `variant` `default/danger`, `isLoading`. `ActionSheetFooter` — кнопка «Отмена».
- **`BottomSheet`** (+ `BottomSheetHeader`, `BottomSheetSearch`) — нижняя панель с контентом; `isOpen`, `onClose`, `header`, `children`. `BottomSheetHeader` задаёт заголовок и действия, `BottomSheetSearch` — поиск внутри панели.
- **`ContextMenu`** — всплывающее меню действий у элемента. `trigger`, `isOpen`/`onClose`, `placement` `right/left`, `items: {key, label, icon?, variant?, onClick?, isDisabled?}[]`.

> Все оверлеи управляемые: видимость через `isOpen`, закрытие — обработай `onClose`. Закрытие по Escape/оверлею встроено.

> **Паддинги внутри оверлеев.** `Drawer` и `Modal` уже управляют горизонтальными отступами контентной зоны (`.modal__content-inner`, `.drawer__content-inner`). Компонент, который рендерится внутри, **не должен добавлять свои горизонтальные паддинги** — иначе отступы задвоятся. Если компоненту нужно управлять паддингами самостоятельно (например, `FlowResultView`), сбрось паддинг родительского контейнера через CSS:
> ```css
> .my-component__modal .modal__content-inner {
>   padding: 0;
> }
> ```

### 3.7b Специализированные оверлейные компоненты
- **`FlowResultView`** — экран результата флоу (успех / ошибка / ожидание и т.п.). Рендерится внутри `Modal` или `Drawer`. Управляет собственными отступами — у родительского `.modal__content-inner` / `.drawer__content-inner` нужно обнулить `padding: 0` через CSS.

### 3.8 Навигация и раскладка
- **`PageLayout`** — корневая обёртка страницы. `size` `s/m/l` (макс. ширина контента; **строго lowercase**), `navigationBar` (обычно `NavigationBar`), `rightPanel` (только при `size="s"`), `topOffset` (высота фиксированного хедера над макетом, число px, по умолч. `0`), `children`. Адаптивен: ≤1023px nav становится верхней sticky-полосой, на десктопе — боковой колонкой.
- **`NavigationBar`** — панель страницы с заголовком; **сама переключается** десктоп (>1023px) / адаптив (≤1023px). Десктоп: `title`, `description`, breadcrumb `rootLinkLabel`, `items` (`link`/`step`), кнопки back/action. Адаптив: `titleVariant` `none/title/title-description/step-progress/percent-progress/image`, `progress`, левая/правые кнопки (`rightAccessoryVariant`), `isInverted`. Общее: `isSticky`.
- **`TabsCarousel`** — горизонтальный скроллируемый список табов с анимацией переключения. `tabs` (массив `{value, label, badge?}`), `value`/`onChange` (controlled), `children` (контент активного таба). Поддерживает `Badge` на каждом табе.
- **`MainPageNavigationBar`** (+ `SCINavigationButton`) — главная навигация сайта (логотип, разделы, клиент, быстрые действия). `activeNavItem` `main/payments/services`, флаги `has*` (live/select/subscription/tin/newPush), `isSecondLine`, данные клиента и колбэки `onNav*Click`. Адаптивна.
- **`Footer`** (+ `FooterIconButton`) — фиксированный подвал с действиями, `position: sticky; bottom: 0`. `layout` `1-button/2-buttons-in-line/3-buttons/page-control-button/stepper-button`, `primaryAction`/`secondaryAction` (`{label, onClick, isDisabled, isLoading}`), `iconAction`, степпер (`stepperValue`, `onStepperIncrease/Decrease`), пагинация (`pageControlCount/Value/onPageControlChange`), `description`, управляемая видимость `isVisible`. При передаче `isVisible` футер становится отдельным fixed-слоем (`right: 0; bottom: 0; left: 0`) и применяет стандартный переход `animate-footer-in/out` (`0.3s ease-out`, `translateY(100%)` в скрытом состоянии). Правила показа и скрытия вычисляй в родительском компоненте. Обычный Footer ставь последним элементом потока контента на всю ширину; не оборачивай его в контейнер с `overflow`, иначе sticky-поведение сломается.
- **`Stepper`** — управление числовым значением. `value`, `onChange`, `min`, `max`, `step`, `size` `s/m`, `disabled`, `readonly` (эти имена соответствуют API компонента).

### 3.9 Виджеты и промо
- **`Widget`** (+ `WidgetTitle`, `WidgetTitleAccessory`) — блок с кликабельным заголовком и зоной контента. `Widget` принимает все пропсы `WidgetTitle` плюс `children`, `contentClassName`, `minContentHeight`. `WidgetTitle`: `title`, `description`/`hasDescription`, `hasChevron`, правый аксессуар (`rightAccessoryVariant`: `icon/link/link-icon/icon-icon/description/editing-mode/none/custom`, `rightAccessoryText`, `rightAccessoryIcon`, `onRightAccessoryClick`).
- **`PromoPageBanner`** — крупный хедер промо-страницы. Раздельные desktop/adaptive `title`/`description`, `buttonLabel`/`onButtonClick`, `image`/`imageSrc`, флаги `has*`. Адаптивен, ширина 100%.
- **`PromoPageCard`** — карточка контента промо-страницы. `title`, `description`, `avatar`, `image`/`imageSrc`, `isHorizontal`, флаги `has*`.
- **`PromoPageHorizontalCard`** — широкая карточка во всю ширину. `variant` `default/accent` (accent добавляет кнопку `buttonLabel`/`onButtonClick`), `title`, `description`, `image`.
- **`PromoPageTitle`** — заголовок промо-страницы: `ts-600-5xl` на desktop и `ts-600-3xl` на адаптиве.
- **`PromoPageSteps`** — блок последовательных шагов. `steps`, `hasTitle`, `title`; шаг поддерживает `tag`, `title`, `description`, `leftContent`, `image`/`imageSrc`. На адаптиве изображение располагается над текстом и занимает всю ширину.
- **`PromoPageCta`** — CTA-блок промо-страницы. `variant` `form/content`, `children`, `content`, `action`, `isSuccess`; success-состояние настраивается через `successTitle`, `successDescription`, `successAction`, `successImage`/`successImageSrc`, `successContent`.

> **Промо-страницы:** для их сборки используй скилл `$dt-ui-builder`. Компоненты `PromoPageBanner` / `PromoPageCard` / `PromoPageHorizontalCard` применяй там, где они подходят по смыслу; кастомные блоки допустимы для уникальной композиции, но только на DS-токенах, `ts-*` типографике и готовых интерактивных компонентах.

---
