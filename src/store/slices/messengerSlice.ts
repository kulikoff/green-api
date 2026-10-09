import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import chatThunk from '@/store/thunks/chatThunk';
import sessionThunk from '@/store/thunks/sessionThunk';

type NewChatState = {
  isOpen: boolean;
  phone: string;
  error: string | null;
  isSubmitting: boolean;
};

type MessengerState = {
  notice: string | null;
  pollError: string | null;
  pollAttempt: number;
  newChat: NewChatState;
};

const createClosedNewChat = (): NewChatState => ({
  isOpen: false,
  phone: '',
  error: null,
  isSubmitting: false,
});

const createInitialState = (): MessengerState => ({
  notice: null,
  pollError: null,
  pollAttempt: 0,
  newChat: createClosedNewChat(),
});

export default createSlice({
  name: 'messenger',

  initialState: createInitialState(),

  reducers: {
    setNotice: (state, action: PayloadAction<string | null>) => {
      state.notice = action.payload;
    },

    markPollingFailed: (state, action: PayloadAction<string>) => {
      state.pollError = action.payload;
    },

    markPollingSucceeded: (state) => {
      state.pollError = null;
    },

    retryPolling: (state) => {
      state.pollError = null;
      state.pollAttempt += 1;
    },

    openNewChat: (state) => {
      state.newChat = {...createClosedNewChat(), isOpen: true};
    },

    closeNewChat: (state) => {
      const {isSubmitting} = state.newChat;

      if (isSubmitting) {
        return;
      }

      state.newChat = createClosedNewChat();
    },

    changeNewChatPhone: (state, action: PayloadAction<string>) => {
      state.newChat.phone = action.payload;
      state.newChat.error = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(sessionThunk.logout.fulfilled, () => createInitialState());

    builder.addCase(chatThunk.openChat.pending, (state) => {
      state.newChat.isSubmitting = true;
      state.newChat.error = null;
    });

    builder.addCase(chatThunk.openChat.fulfilled, (state) => {
      state.newChat = createClosedNewChat();
    });

    builder.addCase(chatThunk.openChat.rejected, (state, action) => {
      const {payload} = action;

      state.newChat.isSubmitting = false;
      state.newChat.error = payload ?? null;
    });

    builder.addCase(chatThunk.sendMessage.fulfilled, (state) => {
      state.notice = null;
    });

    builder.addCase(chatThunk.sendMessage.rejected, (state, action) => {
      const {payload} = action;

      if (!payload) {
        return;
      }

      const {notice} = payload;

      state.notice = notice;
    });
  },
});
