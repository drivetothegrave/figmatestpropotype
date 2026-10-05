export type { DsIconSvgProps } from './types';
export * from './12/Filled';
export * from './24/Stroked';
// The common Circle defaults to 24px. Import from './32/Stroked' for 30–32px slots.
export { Circle } from './24/Stroked';
// 20px Stroked, Filled, and 1px Stroked icons are available from their explicit subpaths.
// QuestionCircle belongs to the dedicated 1px Stroked set and is not included in this barrel.
export { LinesThreeHorizontalWide } from './20/Stroked';
// 24px Filled icons are available from '@pluginwoman/t-ds/icons/24/Filled'.
// They are not re-exported here because many glyph names intentionally overlap with 24px Stroked.
// Graphic (colored) icons are NOT in this barrel — import from '@pluginwoman/t-ds/icons/20/Graphic'
// ChevronDown, Checkmark, InformationCircle and CrossCircle exist in multiple sizes — 24px wins in the barrel
// For 20px Checkmark import directly: import { Checkmark } from './20/Stroked'
// Minus also exists in 16px — 24px wins in the barrel
export { ChevronDown, Checkmark, InformationCircle, CrossCircle, Minus } from './24/Stroked';
// 32px Stroked and Filled icons are available from their explicit subpaths.
// 16px Stroked and Filled icons are also available from their explicit subpaths.
