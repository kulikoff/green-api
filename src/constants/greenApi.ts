import type ValueOf from '@/types/ValueOf';

export const GREEN_API_NAME = 'GREEN-API';

export const DEFAULT_GREEN_API_URL = 'https://api.green-api.com';

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  DELETE: 'DELETE',
} as const;

export const HTTP_STATUSES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  RATE_LIMIT: 469,
} as const;

export const API_URL_PROTOCOLS = {
  HTTPS: 'https:',
  HTTP: 'http:',
} as const;

export type ApiUrlProtocol = ValueOf<typeof API_URL_PROTOCOLS>;

export const GREEN_API_METHODS = {
  GET_STATE: 'getStateInstance',
  CHECK_ACCOUNT: 'checkAccount',
  SEND_MESSAGE: 'sendMessage',
  RECEIVE_NOTIFICATION: 'receiveNotification',
  DELETE_NOTIFICATION: 'deleteNotification',
} as const;

export const RECEIVE_NOTIFICATION_TIMEOUT_SECONDS = 20;

export const MAX_TEXT_MESSAGE_LENGTH = 4000;

export const INSTANCE_STATES = {
  AUTHORIZED: 'authorized',
  NOT_AUTHORIZED: 'notAuthorized',
  STARTING: 'starting',
  BLOCKED: 'blocked',
  SLEEP_MODE: 'sleepMode',
  YELLOW_CARD: 'yellowCard',
} as const;

export const GREEN_API_ERROR_CODES = {
  NETWORK: 'network',
  UNAUTHORIZED: 'unauthorized',
  VALIDATION: 'validation',
  WEBHOOK_CONFIGURED: 'webhook-configured',
  INSTANCE_NOT_READY: 'instance-not-ready',
  ACCOUNT_NOT_FOUND: 'account-not-found',
  RATE_LIMIT: 'rate-limit',
  UNKNOWN: 'unknown',
} as const;

export type GreenApiErrorCode = ValueOf<typeof GREEN_API_ERROR_CODES>;

export const WEBHOOK_TYPES = {
  INCOMING_MESSAGE_RECEIVED: 'incomingMessageReceived',
} as const;

export const INCOMING_MESSAGE_TYPES = {
  TEXT: 'textMessage',
} as const;

export const CHAT_TYPES = {
  USER: 'user',
  GROUP: 'group',
  CHANNEL: 'channel',
  BOT: 'bot',
} as const;
