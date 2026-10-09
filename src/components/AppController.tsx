import {useSelector} from 'react-redux';
import LoginPageController from '@/components/pages/login/LoginPageController';
import MessengerPageController from '@/components/pages/messenger/MessengerPageController';
import {credentialsSelector} from '@/store/selectors/sessionSelectors';

export default function AppController() {
  const credentials = useSelector(credentialsSelector);

  return credentials ? <MessengerPageController /> : <LoginPageController />;
}
