import type ValueOf from '@/types/ValueOf';

export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
} as const;

export type ButtonVariant = ValueOf<typeof BUTTON_VARIANTS>;

export const BUTTON_TYPES = {
  BUTTON: 'button',
  SUBMIT: 'submit',
} as const;

export type ButtonType = ValueOf<typeof BUTTON_TYPES>;
