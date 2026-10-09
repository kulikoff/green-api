import {combineReducers, configureStore} from '@reduxjs/toolkit';
import chatSlice from './slices/chatSlice';
import messengerSlice from './slices/messengerSlice';
import sessionSlice from './slices/sessionSlice';

const reducer = combineReducers({
  session: sessionSlice.reducer,
  chat: chatSlice.reducer,
  messenger: messengerSlice.reducer,
});

export const store = configureStore({reducer});

export type RootState = ReturnType<typeof store.getState>;

export type DispatchType = typeof store.dispatch;
