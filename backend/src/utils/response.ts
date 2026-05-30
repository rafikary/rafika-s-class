import { Response } from 'express';
import { ApiResponse, ApiError } from '../types';

export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  error: ApiError,
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res.status(statusCode).json(response);
};

export const createError = (
  code: string,
  message: string,
  details?: any
): ApiError => {
  return { code, message, details };
};
