import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../lib/logger.service';
import config from '../config/config.service';

export const errorResponse = (
  res: Response,
  message?: string,
  statusCode?: StatusCodes,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any,
) => {
  try {
    return res
      .status(statusCode ?? StatusCodes.BAD_REQUEST)
      .json({ status: 'error', message: message, data: payload });
  } catch (err) {
    logger.error(err);
  }
};

export const successResponse = (
  res: Response,
  message?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Record<any, any>,
  statusCode: StatusCodes = StatusCodes.OK,
) => {
  try {
    return res
      .status(statusCode)
      .json({ status: 'success', message: message, data: payload });
  } catch (err) {
    logger.error(err);
  }
};

export const generateResetPasswordLink = (token: string) => {
  return `${config.CLIENT_SIDE_URL}/reset-password?token=${token}`;
};

export const generateSetPasswordLink = (token: string) => {
  return `${config.CLIENT_SIDE_URL}/set-password?token=${token}`;
};
