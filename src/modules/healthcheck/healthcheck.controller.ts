import type { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ResponseExtended } from '../../types';
import { errorResponse } from '../../utils/api.utils';

// Healthcheck uses raw response (not the standard envelope)
export const handleHealthCheck = async (
  _: Request,
  res: ResponseExtended,
): Promise<void> => {
  const healthCheck = {
    uptime: process.uptime(),
    responseTime: process.hrtime(),
    message: 'OK',
    timestamp: Date.now(),
  };

  try {
    // Direct JSON response for healthcheck (no envelope)
    res.status(StatusCodes.OK).json(healthCheck);
    return;
  } catch (error) {
    healthCheck.message = (error as Error).message;

    errorResponse(
      res,
      (error as Error).message,
      StatusCodes.SERVICE_UNAVAILABLE,
      healthCheck,
    );
    return;
  }
};
