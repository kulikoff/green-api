import {createSelector} from '@reduxjs/toolkit';
import {MESSAGE_DIRECTIONS} from '@/constants/chat';
import {formatChatTime, generateChatTitle} from '@/utils/common';
import type {RootState} from '@/store/store';
import type {Chat} from '@/types/Chat';
import type {ChatListItemModel} from '@/types/ChatListItemModel';

const getChatActivity = (chat: Chat): number => {
  const {messages, createdAt} = chat;
  return messages.at(-1)?.createdAt ?? createdAt;
};

const selectChatState = ({chat}: RootState) => chat;

const selectChats = createSelector(selectChatState, ({chats}) => chats);

const selectActiveChatId = createSelector(selectChatState, ({activeChatId}) => activeChatId);

export const activeChatSelector = createSelector(
  selectChats,
  selectActiveChatId,
  (chats, activeChatId) => chats.find(({id}) => id === activeChatId) ?? null,
);

export const chatListItemsSelector = createSelector(selectChats, (chats): ChatListItemModel[] => {
  const now = Date.now();

  return [...chats]
    .sort((left, right) => getChatActivity(right) - getChatActivity(left))
    .map((chat) => {
      const {id, messages, createdAt} = chat;
      const lastMessage = messages.at(-1);
      const title = generateChatTitle(chat);
      const previewPrefix = lastMessage?.direction === MESSAGE_DIRECTIONS.OUTGOING ? 'Вы: ' : '';

      return {
        id,
        title,
        preview: lastMessage ? `${previewPrefix}${lastMessage.text.replace(/\s+/g, ' ').trim()}` : 'Нет сообщений',
        timeLabel: formatChatTime(lastMessage?.createdAt ?? createdAt, now),
      };
    });
});
