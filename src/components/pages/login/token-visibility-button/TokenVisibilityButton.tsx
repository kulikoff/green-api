import styles from './styles.module.css';

import {BUTTON_TYPES} from '@/constants/button';

type TokenVisibilityButtonProps = {
  isVisible: boolean;
  onClick: () => void;
};

export default function TokenVisibilityButton(props: TokenVisibilityButtonProps) {
  const {isVisible, onClick} = props;
  const label = isVisible ? 'Скрыть' : 'Показать';

  return (
    <button type={BUTTON_TYPES.BUTTON} className={styles.reveal} onClick={onClick}>
      {label}
    </button>
  );
}
