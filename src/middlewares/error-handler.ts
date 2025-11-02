import type { NextFunction, Request, Response } from 'express';
import config from '@/config/env';
import logger from '@/plugins/logger';
import type { ResponseExtended } from '@/types';
import { errorResponse } from '@/utils/response.utils';
import { StatusCodesValues } from '@/plugins/magic/status-codes';

interface CustomError extends Error {
  status?: number;
  message: string;
}

/**
 * Global error handler middleware for Express
 * Catches all errors and sends a standardized error response
 */
export const errorHandler = (
  err: CustomError,
  _: Request,
  res: ResponseExtended | Response,
  __: NextFunction,
): void => {
  const statusCode = err.status || 500;
  const errorMessage = err.message || 'Internal Server Error';

  logger.error(`${statusCode}: ${errorMessage}`);

  errorResponse(
    res as ResponseExtended,
    errorMessage,
    statusCode as StatusCodesValues,
    undefined,
    config.NODE_ENV === 'development' ? err.stack : undefined,
  );

  return;
};

export default errorHandler;
