import type { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId =
    (req.headers['x-request-id'] as string) ||
    (req.headers['x-correlation-id'] as string) ||
    nanoid();

  (req as Request & { id?: string }).id = requestId;

  res.setHeader('X-Request-ID', requestId);

  next();
}
