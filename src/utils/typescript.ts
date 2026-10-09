export const isAbortError = (error: unknown): error is Error => error instanceof Error && error.name === 'AbortError';

export const isString = (value: unknown): value is string => typeof value === 'string';
