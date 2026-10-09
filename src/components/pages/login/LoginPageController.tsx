import {useState} from 'react';
import {DEFAULT_GREEN_API_URL} from '@/constants/greenApi';
import {generateUserErrorMessage} from '@/utils/common';
import useStoreDispatch from '@/hooks/useStoreDispatch';
import sessionThunk from '@/store/thunks/sessionThunk';
import LoginPage from './LoginPage';

export default function LoginPageController() {
  const dispatch = useStoreDispatch();
  const [apiUrl, setApiUrl] = useState(DEFAULT_GREEN_API_URL);
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const result = await dispatch(sessionThunk.login({apiUrl, idInstance, apiTokenInstance}));

    if (sessionThunk.login.rejected.match(result)) {
      const {payload} = result;

      setError(payload ?? generateUserErrorMessage(result.error));
      setIsSubmitting(false);
    }
  };

  const handleTokenVisibilityChange = () => setIsTokenVisible((isVisible) => !isVisible);

  return (
    <LoginPage
      apiUrl={apiUrl}
      idInstance={idInstance}
      apiTokenInstance={apiTokenInstance}
      isTokenVisible={isTokenVisible}
      error={error}
      isSubmitting={isSubmitting}
      onApiUrlChange={setApiUrl}
      onIdInstanceChange={setIdInstance}
      onApiTokenInstanceChange={setApiTokenInstance}
      onTokenVisibilityChange={handleTokenVisibilityChange}
      onSubmit={handleSubmit}
    />
  );
}
