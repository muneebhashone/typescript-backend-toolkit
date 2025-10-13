import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { successResponse, errorResponse } from '../../utils/api.utils';

export const handleHealthCheck = async (_: Request, res: Response) => {
  const healthCheck = {
    uptime: process.uptime(),
    responseTime: process.hrtime(),
    message: 'OK',
    timestamp: Date.now(),
  };

  try {
    return successResponse(res, undefined, healthCheck);
  } catch (error) {
    healthCheck.message = (error as Error).message;

    return errorResponse(
      res,
      (error as Error).message,
      StatusCodes.SERVICE_UNAVAILABLE,
      healthCheck,
    );
  }
};
