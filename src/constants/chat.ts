import type ValueOf from '@/types/ValueOf';

export const MESSAGE_DIRECTIONS = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
} as const;

export type MessageDirection = ValueOf<typeof MESSAGE_DIRECTIONS>;

export const MESSAGE_STATUSES = {
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;

export type MessageStatus = ValueOf<typeof MESSAGE_STATUSES>;
