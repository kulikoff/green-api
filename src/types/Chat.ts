import type {MessageDirection, MessageStatus} from '@/constants/chat';

export type ChatMessage = {
  localId: string;
  remoteId: string | null;
  text: string;
  direction: MessageDirection;
  status: MessageStatus;
  createdAt: number;
};

export type Chat = {
  id: string;
  phone: string;
  contactName: string | null;
  draft: string;
  createdAt: number;
  messages: ChatMessage[];
};
