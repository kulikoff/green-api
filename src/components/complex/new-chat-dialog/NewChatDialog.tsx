import styles from './styles.module.css';
import Button from '@/components/basic/button/Button';
import TextField from '@/components/basic/text-field/TextField';
import {VALUE_ESCAPE} from 'keycode-js';
import {AUTO_COMPLETE, INPUT_MODES} from '@/constants/textField';
import type {MouseEvent, SubmitEvent} from 'react';
import {useEffect} from 'react';
import {BUTTON_TYPES, BUTTON_VARIANTS} from '@/constants/button';

type NewChatDialogProps = {
  phone: string;
  error: string | null;
  isSubmitting: boolean;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function NewChatDialog(props: NewChatDialogProps) {
  const {phone, error, isSubmitting, onPhoneChange, onSubmit, onClose} = props;
  const canClose = !isSubmitting;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const {key} = event;
      const isEscape = key === VALUE_ESCAPE;

      if (isEscape && canClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canClose, onClose]);

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const {target, currentTarget} = event;
    const isBackdrop = target === currentTarget;

    if (isBackdrop && canClose) {
      onClose();
    }
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.backdrop} onMouseDown={handleBackdropMouseDown}>
      <form
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
        onSubmit={handleSubmit}
      >
        <h2 id="new-chat-title">Новый чат</h2>

        <p>Номер получателя в MAX. Можно вставить номер с пробелами и скобками.</p>

        <TextField
          id="phone"
          label="Телефон"
          value={phone}
          placeholder="79991234567"
          inputMode={INPUT_MODES.TEL}
          autoComplete={AUTO_COMPLETE.TEL}
          disabled={isSubmitting}
          error={error}
          autoFocus
          testId="new-chat-phone"
          onChange={onPhoneChange}
        />

        <div className={styles.actions}>
          <Button variant={BUTTON_VARIANTS.SECONDARY} disabled={isSubmitting} onClick={onClose}>
            Отмена
          </Button>

          <Button type={BUTTON_TYPES.SUBMIT} isBusy={isSubmitting} data-test-id="new-chat-submit">
            Создать чат
          </Button>
        </div>
      </form>
    </div>
  );
}
