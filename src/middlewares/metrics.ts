import type { Request, Response, NextFunction } from 'express';
import { metricsCollector } from '../observability/metrics';

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const route = req.route?.path || req.path || 'unknown';
  const method = req.method;

  const start = Date.now();
  metricsCollector.startRequest(method, route);

  res.on('finish', () => {
    const duration = Date.now() - start;
    metricsCollector.recordRequest(method, route, res.statusCode, duration);
    metricsCollector.endRequest(method, route);
  });

  res.on('close', () => {
    if (!res.writableEnded) {
      metricsCollector.endRequest(method, route);
    }
  });

  next();
}
