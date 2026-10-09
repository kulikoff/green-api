import type {GreenApiErrorCode} from '@/constants/greenApi';

export default class GreenApiError extends Error {
  readonly code: GreenApiErrorCode;
  readonly status: number | null;

  constructor(code: GreenApiErrorCode, message: string, status: number | null = null) {
    super(message);
    this.name = 'GreenApiError';
    this.code = code;
    this.status = status;
  }
}
