import { Request, Response, NextFunction } from 'express';
import config from '../config/config.service';
import logger from '../lib/logger.service';

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

  res.status(statusCode).json({
    success: false,
    error: {
      message: errorMessage,
      ...(config.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export default globalErrorHandler;
