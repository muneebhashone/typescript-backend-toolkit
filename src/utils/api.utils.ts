import type { Response } from 'express';
import { StatusCodes, StatusCodesValues } from '@/openapi/status-codes';
import config from '../config/env';
import type { ResponseExtended } from '../types';

export const errorResponse = (
  res: ResponseExtended | Response,
  message?: string,
  statusCode?: StatusCodesValues,
  payload?: unknown,
  stack?: string,
): void => {
  res.status(statusCode ?? StatusCodes.BAD_REQUEST).json({
    success: false,
    message: message,
    data: payload,
    stack: config.NODE_ENV === 'development' ? stack : undefined,
  });

  return;
};

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

export const generateResetPasswordLink = (token: string) => {
  return `${config.CLIENT_SIDE_URL}/reset-password?token=${token}`;
};

export const generateSetPasswordLink = (token: string) => {
  return `${config.CLIENT_SIDE_URL}/set-password?token=${token}`;
};
