import type {GreenApiCredentials} from '@/types/GreenApiCredentials';
import {API_URL_PROTOCOLS, type ApiUrlProtocol, MAX_TEXT_MESSAGE_LENGTH} from '@/constants/greenApi';

export const validateCredentials = (credentials: GreenApiCredentials): string | null => {
  const {apiUrl, idInstance, apiTokenInstance} = credentials;

  if (!/^\d+$/.test(idInstance)) {
    return 'idInstance должен состоять из цифр.';
  }

  if (!apiTokenInstance) {
    return 'Укажите apiTokenInstance.';
  }

  let url: URL;

  try {
    url = new URL(apiUrl);
  } catch {
    return 'Некорректный адрес API.';
  }

  if (![API_URL_PROTOCOLS.HTTPS, API_URL_PROTOCOLS.HTTP].includes(url.protocol as ApiUrlProtocol)) {
    return 'Адрес API должен начинаться с http:// или https://.';
  }

  return null;
};

export const validateOutgoingText = (text: string): string | null => {
  if (!text) {
    return 'Введите текст сообщения.';
  }

  if (text.length > MAX_TEXT_MESSAGE_LENGTH) {
    return `Сообщение длиннее ${MAX_TEXT_MESSAGE_LENGTH} символов.`;
  }

  return null;
};

export const validateMaxPhone = (digits: string): string | null => {
  if (!digits) {
    return 'Введите номер телефона.';
  }

  const isRussia = digits.startsWith('7') && digits.length === 11;
  const isBelarus = digits.startsWith('375') && digits.length === 12;

  if (!isRussia && !isBelarus) {
    return 'Нужен номер РФ (11 цифр, код 7) или РБ (12 цифр, код 375).';
  }

  return null;
};
