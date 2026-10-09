import styles from './styles.module.css';
import MaxLogoIcon from '@/icons/max-logo.svg?react';
import Button from '@/components/basic/button/Button';
import TextField from '@/components/basic/text-field/TextField';
import TokenVisibilityButton from '@/components/pages/login/token-visibility-button/TokenVisibilityButton';
import {GREEN_API_NAME} from '@/constants/greenApi';
import {INPUT_MODES, TEXT_FIELD_TYPES} from '@/constants/textField';
import type {SubmitEvent} from 'react';
import {BUTTON_TYPES} from '@/constants/button';

type LoginPageProps = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
  isTokenVisible: boolean;
  error: string | null;
  isSubmitting: boolean;
  onApiUrlChange: (value: string) => void;
  onIdInstanceChange: (value: string) => void;
  onApiTokenInstanceChange: (value: string) => void;
  onTokenVisibilityChange: () => void;
  onSubmit: () => void;
};

export default function LoginPage(props: LoginPageProps) {
  const {
    apiUrl,
    idInstance,
    apiTokenInstance,
    isTokenVisible,
    error,
    isSubmitting,
    onApiUrlChange,
    onIdInstanceChange,
    onApiTokenInstanceChange,
    onTokenVisibilityChange,
    onSubmit,
  } = props;
  const tokenInputType = isTokenVisible ? TEXT_FIELD_TYPES.TEXT : TEXT_FIELD_TYPES.PASSWORD;
  const isErrorVisible = error !== null;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            <MaxLogoIcon width={22} height={22} />
          </span>

          <div>
            <h1>MAX</h1>
            <p>Текстовые сообщения через {GREEN_API_NAME}</p>
          </div>
        </div>

        <TextField
          id="apiUrl"
          label="apiUrl"
          value={apiUrl}
          type={TEXT_FIELD_TYPES.URL}
          inputMode={INPUT_MODES.URL}
          disabled={isSubmitting}
          testId="api-url"
          onChange={onApiUrlChange}
        />

        <TextField
          id="idInstance"
          label="idInstance"
          value={idInstance}
          inputMode={INPUT_MODES.NUMERIC}
          disabled={isSubmitting}
          testId="id-instance"
          onChange={onIdInstanceChange}
        />

        <TextField
          id="apiTokenInstance"
          label="apiTokenInstance"
          value={apiTokenInstance}
          type={tokenInputType}
          disabled={isSubmitting}
          testId="api-token"
          accessory={<TokenVisibilityButton isVisible={isTokenVisible} onClick={onTokenVisibilityChange} />}
          onChange={onApiTokenInstanceChange}
        />

        {isErrorVisible && (
          <p className={styles.error} role="alert" data-test-id="form-error">
            {error}
          </p>
        )}

        <Button className={styles.submit} type={BUTTON_TYPES.SUBMIT} isBusy={isSubmitting} data-test-id="login-submit">
          Войти
        </Button>
      </form>
    </main>
  );
}
