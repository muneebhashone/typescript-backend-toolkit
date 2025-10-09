import { Router, type Request, type Response } from 'express';
import { metricsCollector } from '../observability/metrics';

export type HealthCheck = {
  name: string;
  check: () => Promise<boolean>;
};

export interface OpsRoutesOptions {
  healthChecks?: HealthCheck[];
  metricsEnabled?: boolean;
}

export function createOpsRoutes(options: OpsRoutesOptions = {}): Router {
  const router = Router();
  const { healthChecks = [], metricsEnabled = true } = options;

  router.get('/health', async (_req: Request, res: Response) => {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    res.status(200).json(status);
  });

  router.get('/readiness', async (_req: Request, res: Response) => {
    try {
      const checks = await Promise.all(
        healthChecks.map(async ({ name, check }) => {
          try {
            const healthy = await check();
            return { name, healthy, error: null };
          } catch (error) {
            return {
              name,
              healthy: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        }),
      );

      const allHealthy = checks.every((c) => c.healthy);
      const status = {
        status: allHealthy ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks,
      };

      res.status(allHealthy ? 200 : 503).json(status);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  if (metricsEnabled) {
    router.get('/metrics', async (_req: Request, res: Response) => {
      try {
        const metrics = await metricsCollector.getMetrics();
        res.set('Content-Type', metricsCollector.register.contentType);
        res.send(metrics);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to collect metrics',
        });
      }
    });
  }

  return router;
}

export default createOpsRoutes;
