import type { Server } from 'http';
import logger from '@/plugins/observability/logger';

export type CleanupFunction = () => Promise<void> | void;

export interface LifecycleOptions {
  gracefulShutdownTimeout?: number;
}

export class LifecycleManager {
  private cleanupHandlers: CleanupFunction[] = [];
  private server?: Server;
  private shuttingDown = false;
  private gracefulShutdownTimeout = 30000;

  constructor(options?: LifecycleOptions) {
    if (options?.gracefulShutdownTimeout) {
      this.gracefulShutdownTimeout = options.gracefulShutdownTimeout;
    }
  }

  registerServer(server: Server): void {
    this.server = server;
  }

  registerCleanup(handler: CleanupFunction): void {
    this.cleanupHandlers.push(handler);
  }

  setupSignalHandlers(): void {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

    for (const signal of signals) {
      process.on(signal, () => {
        logger.info(`Received ${signal}, starting graceful shutdown...`);
        this.gracefulShutdown().catch((err) => {
          logger.error({ err }, 'Error during graceful shutdown');
          process.exit(1);
        });
      });
    }

    process.on('uncaughtException', (err) => {
      logger.error({ err }, 'Uncaught exception');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled rejection');
    });
  }

  private async gracefulShutdown(): Promise<void> {
    if (this.shuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }

    this.shuttingDown = true;

    const shutdownTimer = setTimeout(() => {
      logger.error('Graceful shutdown timeout exceeded, forcing exit');
      process.exit(1);
    }, this.gracefulShutdownTimeout);

    try {
      if (this.server) {
        logger.info('Closing HTTP server...');
        await new Promise<void>((resolve, reject) => {
          this.server!.close((err) => {
            if (err) {
              logger.error({ err }, 'Error closing HTTP server');
              reject(err);
            } else {
              logger.info('HTTP server closed');
              resolve();
            }
          });
        });
      }

      logger.info('Running cleanup handlers...');
      await Promise.all(
        this.cleanupHandlers.map(async (handler, index) => {
          try {
            await handler();
            logger.debug(`Cleanup handler ${index + 1} completed`);
          } catch (err) {
            logger.error({ err, index }, `Cleanup handler ${index + 1} failed`);
          }
        }),
      );

      clearTimeout(shutdownTimer);
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (err) {
      clearTimeout(shutdownTimer);
      logger.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  }
}

export default LifecycleManager;
