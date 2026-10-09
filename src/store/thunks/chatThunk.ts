import {createAsyncThunk} from '@reduxjs/toolkit';
import {generateUserErrorMessage} from '@/utils/common';
import type {Chat} from '@/types/Chat';
import type {RootState} from '@/store/store';
import GreenApiService from '@/services/GreenApiService';

const AUTH_REQUIRED_NOTICE = 'Сначала войдите в инстанс.';

type ChatThunkSendMessageArg = {
  chatId: string;
  localId: string;
  text: string;
};

type ChatThunkSendMessageResult = {
  chatId: string;
  localId: string;
  remoteId: string;
};

type ChatThunkSendMessageReject = {
  chatId: string;
  localId: string;
  notice: string;
};

export default {
  sendMessage: createAsyncThunk<
    ChatThunkSendMessageResult,
    ChatThunkSendMessageArg,
    {state: RootState; rejectValue: ChatThunkSendMessageReject}
  >(
    'chat/sendMessage',

    async (payload, thunkApi) => {
      const {chatId, localId, text} = payload;
      const {getState, rejectWithValue} = thunkApi;
      const {session} = getState();
      const {credentials} = session;

      if (!credentials) {
        return rejectWithValue({chatId, localId, notice: AUTH_REQUIRED_NOTICE});
      }

      try {
        const remoteId = await new GreenApiService(credentials).sendMessage(chatId, text);

        return {chatId, localId, remoteId};
      } catch (error: unknown) {
        return rejectWithValue({chatId, localId, notice: generateUserErrorMessage(error)});
      }
    },
  ),

  openChat: createAsyncThunk<Chat, void, {state: RootState; rejectValue: string}>(
    'chat/openChat',

    async (payload, thunkApi) => {
      const {getState, rejectWithValue} = thunkApi;
      const {session, messenger} = getState();
      const {credentials} = session;
      const {newChat} = messenger;
      const {phone} = newChat;

      if (!credentials) {
        return rejectWithValue(AUTH_REQUIRED_NOTICE);
      }

      try {
        return await new GreenApiService(credentials).openChat(phone);
      } catch (error: unknown) {
        return rejectWithValue(generateUserErrorMessage(error));
      }
    },
  ),
};
