import React from 'react';
import { ChevronDown } from '@pluginwoman/t-ds/icons/32/Stroked';

/** Шеврон для чипов-выпадашек, как в макетах: иконка из набора 32px в размере 20px вместо треугольника t-ds */
export const ChipChevron: React.FC = () => (
  <span className="ds-icon chip-chevron__icon" aria-hidden="true">
    <ChevronDown />
  </span>
);
