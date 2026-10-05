## 3. Иконки

Этот гайд описывает экспорт и правила использования иконок t-ds. Выбирай subpath по размеру и начертанию; в репозитории сверяй экспорты с `src/assets/Icon/`, в установленном пакете — с `package.json` и декларациями типов.

**Subpath-импорты** — единственный способ подключить иконки из пакета:

| Subpath | Содержимое | Конфликты |
|---|---|---|
| `@pluginwoman/t-ds/icons` | Баррель всех размеров | 24px побеждает при совпадении имён |
| `@pluginwoman/t-ds/icons/12/Filled` | 12px Filled | — |
| `@pluginwoman/t-ds/icons/16/Filled` | 16px Filled | — |
| `@pluginwoman/t-ds/icons/16/Stroked` | 16px Stroked | — |
| `@pluginwoman/t-ds/icons/20/Filled` | 20px Filled | — |
| `@pluginwoman/t-ds/icons/20/Stroked` | 20px Stroked | — |
| `@pluginwoman/t-ds/icons/20/Stroked1px` | 20px Stroked, stroke 1px: `InformationCircle`, `KonturTalk`, `QuestionCircle` | — |
| `@pluginwoman/t-ds/icons/20/Graphic` | 20px Graphic | — |
| `@pluginwoman/t-ds/icons/24/Filled` | 24px Filled | — |
| `@pluginwoman/t-ds/icons/24/Stroked` | 24px Stroked | — |
| `@pluginwoman/t-ds/icons/32/Filled` | 32px Filled | — |
| `@pluginwoman/t-ds/icons/32/Stroked` | 32px Stroked | — |

```tsx
// Большинство случаев — баррель, 24px версия
import { Circle, ChevronRight, Checkmark } from '@pluginwoman/t-ds/icons'

// Когда нужен конкретный размер иконки с конфликтующим именем
import { InformationCircle } from '@pluginwoman/t-ds/icons/20/Filled'
import { Acquiring, QRCode } from '@pluginwoman/t-ds/icons/24/Filled'
import { QuestionCircle, KonturTalk } from '@pluginwoman/t-ds/icons/20/Stroked1px'
```

`QuestionCircle` is no longer exported from `@pluginwoman/t-ds/icons` or `@pluginwoman/t-ds/icons/20/Stroked`; import it from the dedicated `20/Stroked1px` set.

- Оборачивай иконку в `.ds-icon` с размерным модификатором — она наследует `currentColor` и масштабируется:
  ```tsx
  <span className="ds-icon ds-icon--m" aria-hidden="true"><ChevronRight /></span>
  ```
  Размеры: `--2xs` 12 · `--xs` 16 · `--s` 20 · `--m` 24 · `--l` 32 (плюс служебные 18/30 через `--icon-size`).
- В большинстве компонентов иконку передают как `ReactNode` в проп (`icon`, `leftAccessory`, `left`) — обёртку `.ds-icon` компонент добавляет сам.

**Как работает цвет иконки.** Иконки используют `currentColor`; конкретная SVG может задавать `fill` сама. Обёртка `.ds-icon` выставляет `fill: currentColor` для вложенного `svg`, а цвет задаётся свойством `color` на обёртке или самом элементе иконки.

```tsx
// через обёртку .ds-icon — цвет задаётся на span
<span className="ds-icon ds-icon--m" style={{ color: 'var(--primitive-brand)' }} aria-hidden="true">
  <Plus />
</span>

// через проп style на иконке — работает там, где компонент уже применяет fill: currentColor
<Checkmark style={{ color: 'var(--primitive-success)' }} />

// через CSS-класс родительского компонента
.my-button { color: var(--primitive-error); }
// → SVG внутри автоматически станет красным
```

> Если цвет не применяется, проверь, обёрнута ли иконка в `.ds-icon` или задаёт ли компонент собственные правила для `svg`; не добавляй новое правило `fill` без проверки реализации.
