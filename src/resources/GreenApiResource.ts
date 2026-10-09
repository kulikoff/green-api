import {
  GREEN_API_ERROR_CODES,
  GREEN_API_METHODS,
  GREEN_API_NAME,
  HTTP_METHODS,
  HTTP_STATUSES,
  INSTANCE_STATES,
} from '@/constants/greenApi';
import GreenApiError from '@/helpers/GreenApiError';
import {isAbortError, isString} from '@/utils/typescript';
import type {GreenApiCredentials} from '@/types/GreenApiCredentials';
import type {ReceivedNotification} from '@/types/Notification';

const UNAUTHORIZED_STATUSES: readonly number[] = [HTTP_STATUSES.UNAUTHORIZED, HTTP_STATUSES.FORBIDDEN];

type StateInstanceResponse = {stateInstance?: string};
type CheckAccountResponse = {status?: boolean; reason?: string; exist?: boolean; chatId?: string};
type SendMessageResponse = {idMessage?: string};

const checkAccountFailure = (reason: unknown): GreenApiError => {
  const text = isString(reason) ? reason : '';

  if (text.toLowerCase().includes('limit')) {
    return new GreenApiError(
      GREEN_API_ERROR_CODES.RATE_LIMIT,
      'Слишком много проверок номеров. Подождите и попробуйте снова.',
    );
  }

  return new GreenApiError(GREEN_API_ERROR_CODES.INSTANCE_NOT_READY, 'Инстанс не авторизован или ещё запускается.');
};

const readBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const describeUnauthorizedInstance = (state: string): string => {
  switch (state) {
    case INSTANCE_STATES.NOT_AUTHORIZED:
      return `Инстанс не авторизован. Подключите номер MAX в личном кабинете ${GREEN_API_NAME}.`;
    case INSTANCE_STATES.STARTING:
      return 'Инстанс ещё запускается. Подождите немного и войдите снова.';
    case INSTANCE_STATES.BLOCKED:
      return 'Инстанс заблокирован.';
    case INSTANCE_STATES.SLEEP_MODE:
      return 'Инстанс находится в спящем режиме.';
    case INSTANCE_STATES.YELLOW_CARD:
      return 'На инстансе действуют временные ограничения.';
    default:
      return `Инстанс не готов к работе (${state}).`;
  }
};

const mapHttpError = (status: number, body: unknown): GreenApiError => {
  const text = isString(body) ? body : JSON.stringify(body ?? '');
  const normalized = text.toLowerCase();

  if (normalized.includes('webhook')) {
    return new GreenApiError(
      GREEN_API_ERROR_CODES.WEBHOOK_CONFIGURED,
      'Получение сообщений недоступно: в инстансе заполнен webhookUrl. Очистите его в личном кабинете и подождите около минуты.',
      status,
    );
  }

  if (UNAUTHORIZED_STATUSES.includes(status)) {
    return new GreenApiError(GREEN_API_ERROR_CODES.UNAUTHORIZED, 'Неверные idInstance или apiTokenInstance.', status);
  }

  if (status === HTTP_STATUSES.RATE_LIMIT || normalized.includes('limit')) {
    return new GreenApiError(
      GREEN_API_ERROR_CODES.RATE_LIMIT,
      `${GREEN_API_NAME} временно ограничил запросы. Подождите и попробуйте снова.`,
      status,
    );
  }

  if (status === HTTP_STATUSES.BAD_REQUEST) {
    return new GreenApiError(
      GREEN_API_ERROR_CODES.VALIDATION,
      `${GREEN_API_NAME} отклонил запрос. Проверьте данные.`,
      status,
    );
  }

  return new GreenApiError(
    GREEN_API_ERROR_CODES.UNKNOWN,
    `${GREEN_API_NAME} вернул ошибку. Попробуйте ещё раз.`,
    status,
  );
};

export default class GreenApiResource {
  private readonly fetchImpl: typeof fetch;

  constructor(
    private readonly credentials: GreenApiCredentials,
    fetchImpl: typeof fetch = fetch,
  ) {
    this.fetchImpl = fetchImpl.bind(globalThis);
  }

  async getStateInstance(): Promise<void> {
    const {stateInstance} = await this.request<StateInstanceResponse>(
      this.buildMethodUrl(GREEN_API_METHODS.GET_STATE),
      {
        method: HTTP_METHODS.GET,
      },
    );

    if (!stateInstance) {
      throw new GreenApiError(GREEN_API_ERROR_CODES.UNKNOWN, 'Неожиданный ответ getStateInstance.');
    }

    if (stateInstance !== INSTANCE_STATES.AUTHORIZED) {
      throw new GreenApiError(GREEN_API_ERROR_CODES.INSTANCE_NOT_READY, describeUnauthorizedInstance(stateInstance));
    }
  }

  async checkAccount(phoneNumber: number): Promise<string> {
    const {status, reason, exist, chatId} = await this.request<CheckAccountResponse>(
      this.buildMethodUrl(GREEN_API_METHODS.CHECK_ACCOUNT),
      {
        method: HTTP_METHODS.POST,
        body: JSON.stringify({phoneNumber}),
      },
    );

    if (status === false) {
      throw checkAccountFailure(reason);
    }

    if (exist !== true || !chatId) {
      throw new GreenApiError(GREEN_API_ERROR_CODES.ACCOUNT_NOT_FOUND, 'На этом номере нет аккаунта MAX.');
    }

    return chatId;
  }

  async sendMessage(chatId: string, message: string): Promise<string> {
    const {idMessage} = await this.request<SendMessageResponse>(this.buildMethodUrl(GREEN_API_METHODS.SEND_MESSAGE), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({chatId, message}),
    });

    if (!idMessage) {
      throw new GreenApiError(GREEN_API_ERROR_CODES.UNKNOWN, `${GREEN_API_NAME} не вернул идентификатор сообщения.`);
    }

    return idMessage;
  }

  async receiveNotification(timeoutSeconds: number, signal: AbortSignal): Promise<ReceivedNotification | null> {
    const url = new URL(this.buildMethodUrl(GREEN_API_METHODS.RECEIVE_NOTIFICATION));
    url.searchParams.set('receiveTimeout', String(timeoutSeconds));
    const notification = await this.request<Partial<ReceivedNotification> | null>(url, {
      method: HTTP_METHODS.GET,
      signal,
    });

    if (!notification) {
      return null;
    }

    const {receiptId, body} = notification;

    if (typeof receiptId !== 'number' || !Number.isFinite(receiptId)) {
      throw new GreenApiError(GREEN_API_ERROR_CODES.UNKNOWN, 'Неожиданный ответ ReceiveNotification.');
    }

    return {receiptId, body};
  }

  async deleteNotification(receiptId: number, signal: AbortSignal): Promise<void> {
    await this.request(this.buildMethodUrl(GREEN_API_METHODS.DELETE_NOTIFICATION, `/${receiptId}`), {
      method: HTTP_METHODS.DELETE,
      signal,
    });
  }

  private buildMethodUrl(method: string, suffix = ''): string {
    const {apiUrl, idInstance: idInstanceValue, apiTokenInstance: apiTokenInstanceValue} = this.credentials;
    const base = apiUrl.replace(/\/+$/, '');
    const idInstance = encodeURIComponent(idInstanceValue);
    const apiTokenInstance = encodeURIComponent(apiTokenInstanceValue);

    return `${base}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}`;
  }

  private async request<Result>(url: string | URL, init: RequestInit): Promise<Result> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');

    if (init.body) {
      headers.set('Content-Type', 'application/json');
    }

    let response: Response;

    try {
      response = await this.fetchImpl(url, {...init, headers, cache: 'no-store'});
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      throw new GreenApiError(GREEN_API_ERROR_CODES.NETWORK, `Не удалось связаться с ${GREEN_API_NAME}.`);
    }

    const data = await readBody(response);

    if (!response.ok) {
      throw mapHttpError(response.status, data);
    }

    return data as Result;
  }
}
