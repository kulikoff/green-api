import styles from './styles.module.css';
import cn from 'classnames';
import type {ButtonHTMLAttributes, ReactNode} from 'react';
import ButtonLabel from '@/components/basic/button/button-label/ButtonLabel';
import {BUTTON_TYPES, BUTTON_VARIANTS, type ButtonType, type ButtonVariant} from '@/constants/button';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: ButtonVariant;
  type?: ButtonType;
  isBusy?: boolean;
  children: ReactNode;
};

export default function Button(props: ButtonProps) {
  const {
    variant = BUTTON_VARIANTS.PRIMARY,
    isBusy = false,
    className,
    children,
    disabled,
    type = BUTTON_TYPES.BUTTON,
    ...restProps
  } = props;
  const classNameFinal = cn(styles.button, styles[variant], className);
  const isDisabledFinal = disabled || isBusy;

  return (
    <button type={type} className={classNameFinal} disabled={isDisabledFinal} aria-busy={isBusy} {...restProps}>
      <ButtonLabel isBusy={isBusy}>{children}</ButtonLabel>
      {isBusy && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
}
