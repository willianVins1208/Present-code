export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export function createValidationError(message: string): AppError {
  return new AppError(message, 400);
}

export function createNotFoundError(message: string): AppError {
  return new AppError(message, 404);
}

export function createConflictError(message: string): AppError {
  return new AppError(message, 409);
}

export function createStorageError(message: string): AppError {
  return new AppError(`storage error: ${message}`, 500);
}
