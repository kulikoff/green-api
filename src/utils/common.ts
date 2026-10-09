import {DEFAULT_GREEN_API_URL} from '@/constants/greenApi';
import GreenApiError from '@/helpers/GreenApiError';
import type {Chat} from '@/types/Chat';
import type {GreenApiCredentials} from '@/types/GreenApiCredentials';

export const generateChatTitle = (chat: Chat): string => {
  const {contactName, phone} = chat;
  return contactName || formatPhone(phone);
};

export const formatChatTime = (timestamp: number, now = Date.now()): string => {
  const date = new Date(timestamp);
  const current = new Date(now);
  const isSameDay = date.toDateString() === current.toDateString();

  if (isSameDay) {
    return new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'}).format(date);
  }

  return new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'}).format(date);
};

export const normalizeCredentials = (credentials: GreenApiCredentials): GreenApiCredentials => {
  const {apiUrl, idInstance, apiTokenInstance} = credentials;

  return {
    apiUrl: apiUrl.trim().replace(/\/+$/, '') || DEFAULT_GREEN_API_URL,
    idInstance: idInstance.trim(),
    apiTokenInstance: apiTokenInstance.trim(),
  };
};

export const formatPhone = (digits: string): string => {
  if (digits.startsWith('375') && digits.length === 12) {
    return `+375 ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`;
  }

  if (digits.startsWith('7') && digits.length === 11) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }

  return digits ? `+${digits}` : digits;
};

export const normalizePhone = (input: string): string => input.replace(/\D/g, '');

export const generateUserErrorMessage = (error: unknown): string => {
  if (error instanceof GreenApiError) {
    return error.message;
  }

  return 'Что-то пошло не так. Попробуйте ещё раз.';
};
