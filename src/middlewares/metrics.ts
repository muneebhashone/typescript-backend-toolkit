import type { Request, Response, NextFunction } from 'express';
import { metricsCollector } from '@/observability/metrics';

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const route = req.route?.path || req.path || 'unknown';
  const method = req.method;

  const start = Date.now();
  let ended = false;

  metricsCollector.startRequest(method, route);

  res.on('finish', () => {
    const duration = Date.now() - start;
    metricsCollector.recordRequest(method, route, res.statusCode, duration);
    if (!ended) {
      metricsCollector.endRequest(method, route);
      ended = true;
    }
  });

  res.on('close', () => {
    if (!res.writableEnded && !ended) {
      metricsCollector.endRequest(method, route);
      ended = true;
    }
  });

  next();
}
