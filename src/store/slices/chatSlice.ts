import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import {MESSAGE_DIRECTIONS, MESSAGE_STATUSES} from '@/constants/chat';
import type {MessageStatus} from '@/constants/chat';
import type {Chat, ChatMessage} from '@/types/Chat';
import type {IncomingTextMessage} from '@/types/Notification';
import chatThunk from '@/store/thunks/chatThunk';
import sessionThunk from '@/store/thunks/sessionThunk';

type ChatState = {
  chats: Chat[];
  activeChatId: string | null;
};

const createInitialState = (): ChatState => ({
  chats: [],
  activeChatId: null,
});

const findChat = (chats: Chat[], chatId: string, phone?: string | null): Chat | undefined =>
  chats.find(({id, phone: chatPhone}) => id === chatId || (phone ? chatPhone === phone : false));

const openChat = (state: ChatState, chat: Chat) => {
  const {id: openedId, phone: openedPhone} = chat;
  const existing = findChat(state.chats, openedId, openedPhone);

  if (existing) {
    const {id} = existing;
    state.activeChatId = id;
    return;
  }

  state.chats.unshift(chat);
  state.activeChatId = openedId;
};

const resolveOutgoing = (
  state: ChatState,
  chatId: string,
  localId: string,
  remoteId: string | null,
  status: MessageStatus,
) => {
  const chat = findChat(state.chats, chatId);
  const message = chat?.messages.find(({localId: messageLocalId}) => messageLocalId === localId);

  if (!message) {
    return;
  }

  message.remoteId = remoteId;
  message.status = status;
};

export default createSlice({
  name: 'chat',

  initialState: createInitialState(),

  reducers: {
    selectChat: (state, action: PayloadAction<string | null>) => {
      const chatId = action.payload;

      if (chatId !== null && !findChat(state.chats, chatId)) {
        return;
      }

      state.activeChatId = chatId;
    },

    changeDraft: (state, action: PayloadAction<{chatId: string; draft: string}>) => {
      const {chatId, draft} = action.payload;
      const chat = findChat(state.chats, chatId);

      if (!chat) {
        return;
      }

      chat.draft = draft;
    },

    addOutgoing: (state, action: PayloadAction<{chatId: string; message: ChatMessage}>) => {
      const {chatId, message} = action.payload;
      const chat = findChat(state.chats, chatId);

      if (!chat) {
        return;
      }

      chat.messages.push(message);
    },

    retryOutgoing: (state, action: PayloadAction<{chatId: string; localId: string}>) => {
      const {chatId, localId} = action.payload;
      const chat = findChat(state.chats, chatId);

      const message = chat?.messages.find(
        ({localId: messageLocalId, status}) => messageLocalId === localId && status === MESSAGE_STATUSES.FAILED,
      );

      if (!message) {
        return;
      }

      message.status = MESSAGE_STATUSES.SENDING;
    },

    addIncoming: (state, action: PayloadAction<IncomingTextMessage>) => {
      const {chatId, phone, idMessage, senderName, text, createdAt} = action.payload;
      let chat = findChat(state.chats, chatId, phone);

      if (!chat) {
        chat = {
          id: chatId,
          phone: phone ?? '',
          contactName: senderName,
          draft: '',
          createdAt,
          messages: [],
        };
        state.chats.unshift(chat);
      }

      const {messages, contactName} = chat;
      const isDuplicate = messages.some(({remoteId, localId}) => remoteId === idMessage || localId === idMessage);

      if (isDuplicate) {
        return;
      }

      chat.contactName = senderName ?? contactName;

      chat.messages.push({
        localId: idMessage,
        remoteId: idMessage,
        text,
        direction: MESSAGE_DIRECTIONS.INCOMING,
        status: MESSAGE_STATUSES.SENT,
        createdAt,
      });
    },
  },

  extraReducers: (builder) => {
    builder.addCase(sessionThunk.login.fulfilled, () => createInitialState());

    builder.addCase(sessionThunk.logout.fulfilled, () => createInitialState());

    builder.addCase(chatThunk.openChat.fulfilled, (state, action) => openChat(state, action.payload));

    builder.addCase(chatThunk.sendMessage.fulfilled, (state, action) => {
      const {chatId, localId, remoteId} = action.payload;
      resolveOutgoing(state, chatId, localId, remoteId, MESSAGE_STATUSES.SENT);
    });

    builder.addCase(chatThunk.sendMessage.rejected, (state, action) => {
      const {payload} = action;

      if (!payload) {
        return;
      }

      const {chatId, localId} = payload;

      resolveOutgoing(state, chatId, localId, null, MESSAGE_STATUSES.FAILED);
    });
  },
});
