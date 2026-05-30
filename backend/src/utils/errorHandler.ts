import { Request, Response, NextFunction } from 'express';
import { errorResponse, createError } from './response';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    errorResponse(
      res,
      createError(err.code, err.message, err.details),
      err.statusCode
    );
    return;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    errorResponse(
      res,
      createError('DATABASE_ERROR', 'Terjadi kesalahan pada database'),
      500
    );
    return;
  }

  // Validation errors
  if (err.name === 'ZodError') {
    errorResponse(
      res,
      createError('VALIDATION_ERROR', 'Data tidak valid', err),
      400
    );
    return;
  }

  // Default error
  errorResponse(
    res,
    createError('SERVER_ERROR', 'Terjadi kesalahan pada server'),
    500
  );
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
