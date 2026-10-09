import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider as ReduxProvider} from 'react-redux';
import AppController from '@/components/AppController';
import {store} from '@/store/store';
import '@/styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <AppController />
    </ReduxProvider>
  </StrictMode>,
);
