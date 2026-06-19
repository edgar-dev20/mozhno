import { AppError, isAppError } from '@/shared/errors';
import { t, type MessageKey } from '@/i18n';

const ERROR_CODE_TO_KEY: Record<string, string> = {
  NETWORK: 'errors.network',
  UNAUTHORIZED: 'errors.unauthorized',
  FORBIDDEN: 'errors.forbidden',
  NOT_FOUND: 'errors.notFound',
  VALIDATION: 'errors.validation',
  SERVER: 'errors.server',
  TIMEOUT: 'errors.timeout',
  UNKNOWN: 'errors.unexpected',
};

function extractValidationDetails(error: AppError): string {
  const body = error.details as Record<string, unknown> | undefined;
  if (!body) return error.message;
  const details = body['details'] as { field: string; message: string }[] | undefined;
  if (!details || details.length === 0) return error.message;
  if (details.length === 1) {
    return details[0].message;
  }
  return details.map((d) => d.message).join('\n');
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    if (error.code === 'VALIDATION') {
      const detailsText = extractValidationDetails(error);
      if (detailsText !== error.message) return detailsText;
      const key = ERROR_CODE_TO_KEY[error.code];
      return key ? t(key as MessageKey) : error.message;
    }
    if (error.message.startsWith('HTTP ')) {
      return error.message;
    }
    const key = ERROR_CODE_TO_KEY[error.code];
    if (key) return t(key as MessageKey);
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  return 'UNKNOWN';
}

export function shouldRetry(error: unknown): boolean {
  if (isAppError(error)) {
    return error.code === 'NETWORK' || error.code === 'TIMEOUT' || error.code === 'SERVER';
  }
  return false;
}

export function shouldRedirect(error: unknown): boolean {
  if (isAppError(error)) {
    return error.code === 'UNAUTHORIZED';
  }
  return false;
}

export { isAppError, AppError };
export type { ErrorCode } from '@/shared/errors';
