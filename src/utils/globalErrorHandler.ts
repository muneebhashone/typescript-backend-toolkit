import { Request, Response, NextFunction } from 'express';
import config from '../config/config.service';
import logger from '../lib/logger.service';
import { errorResponse } from './api.utils';

interface CustomError extends Error {
  status?: number;
  message: string;
}

export const globalErrorHandler = (
  err: CustomError,
  _: Request,
  res: Response,
  __: NextFunction,
): void => {
  const statusCode = err.status || 500;
  const errorMessage = err.message || 'Internal Server Error';

  logger.error(`${statusCode}: ${errorMessage}`);

  return errorResponse(
    res,
    errorMessage,
    statusCode,
    err,
    config.NODE_ENV === 'development' && err.stack,
  );
};

export default globalErrorHandler;
