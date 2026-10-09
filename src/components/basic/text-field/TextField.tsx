import styles from './styles.module.css';
import {
  AUTO_COMPLETE,
  type AutoComplete,
  type InputMode,
  TEXT_FIELD_TYPES,
  type TextFieldType,
} from '@/constants/textField';
import type {ChangeEvent, ReactNode} from 'react';

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  type?: TextFieldType;
  autoComplete?: AutoComplete;
  placeholder?: string;
  inputMode?: InputMode;
  name?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  accessory?: ReactNode;
  testId?: string;
};

export default function TextField(props: TextFieldProps) {
  const {
    id,
    label,
    value,
    onChange,
    error = null,
    type = TEXT_FIELD_TYPES.TEXT,
    autoComplete = AUTO_COMPLETE.OFF,
    placeholder,
    inputMode,
    name,
    disabled = false,
    autoFocus = false,
    accessory = null,
    testId,
  } = props;
  const inputName = name ?? id;
  const isErrorVisible = error !== null;
  const errorId = isErrorVisible ? `${id}-error` : undefined;
  const ariaInvalid = isErrorVisible ? true : undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);

  return (
    <label className={styles.field} htmlFor={id}>
      <span className={styles.label}>{label}</span>

      <span className={styles.control}>
        <input
          id={id}
          name={inputName}
          className={styles.input}
          value={value}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={ariaInvalid}
          aria-describedby={errorId}
          data-test-id={testId}
          onChange={handleChange}
        />

        {accessory}
      </span>

      {isErrorVisible && (
        <span className={styles.error} id={errorId}>
          {error}
        </span>
      )}
    </label>
  );
}
