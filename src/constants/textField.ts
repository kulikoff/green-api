import type ValueOf from '@/types/ValueOf';

export const INPUT_MODES = {
  URL: 'url',
  NUMERIC: 'numeric',
  TEL: 'tel',
} as const;

export type InputMode = ValueOf<typeof INPUT_MODES>;

export const AUTO_COMPLETE = {
  OFF: 'off',
  TEL: 'tel',
} as const;

export type AutoComplete = ValueOf<typeof AUTO_COMPLETE>;

export const TEXT_FIELD_TYPES = {
  TEXT: 'text',
  PASSWORD: 'password',
  URL: 'url',
} as const;

export type TextFieldType = ValueOf<typeof TEXT_FIELD_TYPES>;
