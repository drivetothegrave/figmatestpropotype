import React from 'react';
import { Search } from '@pluginwoman/t-ds';
import { matchSuggestions } from '../suggest';
import { SuggestPopup, useSuggestKeyboard } from './SuggestPopup';

interface SearchWithSuggestProps {
  value: string;
  onChange: (value: string) => void;
  /** Тексты, из которых предлагаются подсказки (комментарии операций) */
  suggestions: string[];
  placeholder?: string;
  className?: string;
  /** Продолжения запроса («входящие» → «входящие за сентябрь») — показываются первыми */
  completions?: string[];
}

/** Поиск по истории с «умными» подсказками из комментариев (экран «Саджесты в поиске») */
export const SearchWithSuggest: React.FC<SearchWithSuggestProps> = ({
  value,
  onChange,
  suggestions,
  placeholder = 'Контрагент, сумма, назначение',
  className = '',
  completions = [],
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isClosed, setIsClosed] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const items = value.trim()
    ? Array.from(
        new Set([
          ...completions,
          ...matchSuggestions(Array.from(new Set(suggestions)), value).filter((item) => item !== value.trim()),
        ]),
      ).slice(0, 6)
    : [];
  const isOpen = isFocused && !isClosed && items.length > 0;

  const select = (item: string) => {
    onChange(item);
    setIsClosed(true);
  };
  const keyboard = useSuggestKeyboard(items, isOpen, select, () => setIsClosed(true));

  return (
    <div
      ref={ref}
      className={['history-card__search', className].filter(Boolean).join(' ')}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={keyboard.onKeyDown}
    >
      <Search
        value={value}
        onChange={(next) => {
          onChange(next);
          setIsClosed(false);
        }}
        placeholder={placeholder}
      />
      <SuggestPopup
        anchorRef={ref}
        isOpen={isOpen}
        items={items}
        activeIndex={keyboard.activeIndex}
        onSelect={select}
      />
    </div>
  );
};
