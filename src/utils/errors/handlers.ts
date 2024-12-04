import { ApiError, ValidationError, AuthenticationError } from './index';

export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof ValidationError) {
    throw new ApiError(error.message, 400);
  }

  if (error instanceof AuthenticationError) {
    throw new ApiError(error.message, 401);
  }

  if (error instanceof Error) {
    throw new ApiError(error.message, 500);
  }

  throw new ApiError('An unknown error occurred', 500);
}

export function handleValidationError(error: unknown): never {
  if (error instanceof ValidationError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new ValidationError(error.message);
  }

  throw new ValidationError('An unknown validation error occurred');
}

export function handleAuthenticationError(error: unknown): never {
  if (error instanceof AuthenticationError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new AuthenticationError(error.message);
  }

  throw new AuthenticationError();
}