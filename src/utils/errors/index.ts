export class AppError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class ApiError extends AppError {
  constructor(message: string, public statusCode: number) {
    super(message, 'API_ERROR');
    this.name = 'ApiError';
  }
}

export function handleError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(typeof error === 'string' ? error : 'An unknown error occurred');
}