import type { Response } from 'express';
import { StatusCodes, StatusCodesValues } from '@/openapi/status-codes';
import config from '../config/env';
import type { ResponseExtended } from '../types';

/**
 * Send an error response
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 400)
 * @param payload - Optional error payload
 * @param stack - Optional stack trace (only included in development)
 */
export const errorResponse = (
  res: ResponseExtended | Response,
  message?: string,
  statusCode?: StatusCodesValues,
  payload?: unknown,
  stack?: string,
): void => {
  const isDevelopment = config.NODE_ENV === 'development';

  res.status(statusCode ?? StatusCodes.BAD_REQUEST).json({
    success: false,
    message: message,
    data: isDevelopment ? payload : undefined,
    stack: isDevelopment ? stack : undefined,
  });

  return;
};

/**
 * Send a success response
 * @param res - Express response object
 * @param message - Success message
 * @param payload - Response data payload
 * @param statusCode - HTTP status code (default: 200)
 */
export const successResponse = (
  res: ResponseExtended | Response,
  message?: string,
  payload?: Record<string, unknown>,
  statusCode: StatusCodesValues = StatusCodes.OK,
): void => {
  res
    .status(statusCode)
    .json({ success: true, message: message, data: payload });

  return;
};
