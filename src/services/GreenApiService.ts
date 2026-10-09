import {
  CHAT_TYPES,
  GREEN_API_ERROR_CODES,
  INCOMING_MESSAGE_TYPES,
  RECEIVE_NOTIFICATION_TIMEOUT_SECONDS,
  WEBHOOK_TYPES,
} from '@/constants/greenApi';
import GreenApiError from '@/helpers/GreenApiError';
import GreenApiResource from '@/resources/GreenApiResource';
import type {Chat} from '@/types/Chat';
import type {GreenApiCredentials} from '@/types/GreenApiCredentials';
import type {IncomingTextMessage} from '@/types/Notification';
import {normalizeCredentials, normalizePhone} from '@/utils/common';
import {isAbortError} from '@/utils/typescript';
import {validateCredentials, validateMaxPhone, validateOutgoingText} from '@/utils/validation';

const INITIAL_FAILURE_DELAY_MS = 1000;
const MAX_FAILURE_DELAY_MS = 10_000;

type NotificationCallbacks = {
  onNotification: (body: unknown) => void;
  onError: (error: unknown) => void;
  onSuccess: () => void;
};

const delay = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const handleAbort = () => {
      clearTimeout(timer);
      resolve();
    };

    if (signal.aborted) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, ms);

    signal.addEventListener('abort', handleAbort, {once: true});
  });

const throwValidationError = (message: string | null): void => {
  if (message) {
    throw new GreenApiError(GREEN_API_ERROR_CODES.VALIDATION, message);
  }
};

type IncomingWebhook = {
  typeWebhook?: string;
  idMessage?: string;
  timestamp?: number;
  messageData?: {
    typeMessage?: string;
    textMessageData?: {textMessage?: string};
  };
  senderData?: {
    chatId?: string;
    chatType?: string;
    senderPhoneNumber?: number;
    senderContactName?: string;
    senderName?: string;
  };
};

const readPhone = (value?: number): string | null => (value && value > 0 ? String(value) : null);

const readSenderName = (senderData: NonNullable<IncomingWebhook['senderData']>): string | null => {
  const {senderContactName, senderName} = senderData;
  const candidate = senderContactName || senderName;

  return candidate?.trim() || null;
};

const readCreatedAt = (timestamp?: number): number =>
  timestamp ? (timestamp > 10_000_000_000 ? timestamp : timestamp * 1000) : Date.now();

const parseIncomingTextMessage = (body: unknown): IncomingTextMessage | null => {
  const {typeWebhook, messageData, senderData, idMessage, timestamp} = (body ?? {}) as IncomingWebhook;
  const {typeMessage, textMessageData} = messageData ?? {};
  const {textMessage} = textMessageData ?? {};
  const {chatId, chatType, senderPhoneNumber} = senderData ?? {};

  if (
    typeWebhook !== WEBHOOK_TYPES.INCOMING_MESSAGE_RECEIVED ||
    typeMessage !== INCOMING_MESSAGE_TYPES.TEXT ||
    !textMessage ||
    !chatId ||
    !idMessage ||
    chatType !== CHAT_TYPES.USER
  ) {
    return null;
  }

  return {
    idMessage,
    chatId,
    phone: readPhone(senderPhoneNumber),
    senderName: readSenderName(senderData ?? {}),
    text: textMessage,
    createdAt: readCreatedAt(timestamp),
  };
};

export default class GreenApiService {
  constructor(
    credentials: GreenApiCredentials,
    private readonly resource = new GreenApiResource(credentials),
  ) {}

  static async authorize(credentials: GreenApiCredentials, resource?: GreenApiResource): Promise<GreenApiCredentials> {
    const normalized = normalizeCredentials(credentials);

    throwValidationError(validateCredentials(normalized));

    await (resource ?? new GreenApiResource(normalized)).getStateInstance();

    return normalized;
  }

  async openChat(phoneRaw: string, now = Date.now()): Promise<Chat> {
    const phone = normalizePhone(phoneRaw);

    throwValidationError(validateMaxPhone(phone));

    const chatId = await this.resource.checkAccount(Number(phone));

    return {
      id: chatId,
      phone,
      contactName: null,
      draft: '',
      createdAt: now,
      messages: [],
    };
  }

  async sendMessage(chatId: string, text: string): Promise<string> {
    throwValidationError(validateOutgoingText(text));
    return this.resource.sendMessage(chatId, text);
  }

  readIncomingText(body: unknown): IncomingTextMessage | null {
    return parseIncomingTextMessage(body);
  }

  startNotificationPolling(callbacks: NotificationCallbacks): () => void {
    const abortController = new AbortController();

    void this.pollNotifications(callbacks, abortController.signal);

    return () => {
      abortController.abort();
    };
  }

  private async pollNotifications(callbacks: NotificationCallbacks, signal: AbortSignal): Promise<void> {
    const {onNotification, onError, onSuccess} = callbacks;
    let failureDelayMs = INITIAL_FAILURE_DELAY_MS;

    while (!signal.aborted) {
      try {
        const notification = await this.resource.receiveNotification(RECEIVE_NOTIFICATION_TIMEOUT_SECONDS, signal);

        if (signal.aborted) {
          return;
        }

        if (notification) {
          const {body, receiptId} = notification;
          onNotification(body);
          await this.resource.deleteNotification(receiptId, signal);
        }

        failureDelayMs = INITIAL_FAILURE_DELAY_MS;
        onSuccess();
      } catch (error) {
        if (signal.aborted || isAbortError(error)) {
          return;
        }

        onError(error);
        await delay(failureDelayMs, signal);
        failureDelayMs = Math.min(failureDelayMs * 2, MAX_FAILURE_DELAY_MS);
      }
    }
  }
}
