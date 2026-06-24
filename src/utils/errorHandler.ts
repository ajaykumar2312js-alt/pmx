import { ApiErrorDetail } from '../common/types';

export interface FormattedError {
  message: string;
  fieldErrors: Record<string, string>;
  code: string;
}

/**
 * Normalizes an API error or unexpected error into a consistent format for forms/toasts.
 */
export const normalizeError = (error: unknown): FormattedError => {
  const err = error as Record<string, unknown>;
  const message = (err?.message as string) || 'An unexpected error occurred';
  const code = (err?.code as string) || 'UNKNOWN_ERROR';
  const fieldErrors: Record<string, string> = {};

  if (err?.errors && Array.isArray(err.errors)) {
    err.errors.forEach((e: ApiErrorDetail) => {
      if (e.field) {
        fieldErrors[e.field] = e.message;
      }
    });
  }

  return {
    message,
    fieldErrors,
    code,
  };
};
