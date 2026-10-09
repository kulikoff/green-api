import styles from './styles.module.css';
import cn from 'classnames';
import type {ReactNode} from 'react';

type ButtonLabelProps = {
  isBusy: boolean;
  children: ReactNode;
};

export default function ButtonLabel(props: ButtonLabelProps) {
  const {isBusy, children} = props;
  const className = cn(styles.label, isBusy && styles.hidden);

  return <span className={className}>{children}</span>;
}
