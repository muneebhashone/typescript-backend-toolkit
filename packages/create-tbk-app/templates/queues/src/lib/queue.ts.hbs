import type { Processor, QueueOptions, WorkerOptions } from 'bullmq';
import { Queue as BullQueue, Worker } from 'bullmq';

import logger from '@/plugins/logger';
import { cacheProvider, RedisProvider } from './cache';
import { QueueError } from './errors';

type RegisteredQueue = {
  queue: BullQueue;
  worker: Worker;
};

export const registeredQueues: Record<string, RegisteredQueue> = {};

/**
 * Create and register a queue with its worker
 * Auto-initialized singleton pattern - returns existing queue if already registered
 */
export function Queue<Payload>(
  name: string,
  handler: Processor<Payload>,
  queueOptions?: QueueOptions,
  workerOptions?: WorkerOptions,
): BullQueue<Payload> {
  if (registeredQueues[name]) {
    return registeredQueues[name].queue as BullQueue<Payload>;
  }

  try {
    // Get Redis client for queue connection
    if (!(cacheProvider instanceof RedisProvider)) {
      throw new QueueError(
        'Queue requires Redis cache provider. Set CACHE_PROVIDER=redis',
      );
    }

    const redisClient = cacheProvider.getClient();

    const queue = new BullQueue<Payload>(name, {
      connection: redisClient,
      ...queueOptions,
    });

    const worker = new Worker<Payload>(name, handler, {
      connection: redisClient,
      ...workerOptions,
    });

    // Log worker events
    worker.on('completed', (job) => {
      logger.debug({ queueName: name, jobId: job.id }, 'Job completed');
    });

    worker.on('failed', (job, err) => {
      logger.error({ queueName: name, jobId: job?.id, err }, 'Job failed');
    });

    registeredQueues[name] = { queue, worker };

    logger.info({ name }, 'Queue initialized');

    return queue;
  } catch (err) {
    throw new QueueError(`Failed to create queue: ${name}`, err);
  }
}

/**
 * Health check for all registered queues
 * Returns a function compatible with HealthCheck interface
 */
export const checkQueueHealth = () => {
  return async (): Promise<boolean> => {
    try {
      // If no queues registered, consider it healthy
      if (Object.keys(registeredQueues).length === 0) {
        return true;
      }

      // Check if all queues are connected (via Redis)
      const healthChecks = await Promise.all(
        Object.entries(registeredQueues).map(async ([name, { queue }]) => {
          try {
            // Try to get queue metrics as a health check
            await queue.getJobCounts();
            return true;
          } catch (err) {
            logger.error({ queueName: name, err }, 'Queue health check failed');
            return false;
          }
        }),
      );

      return healthChecks.every((healthy) => healthy);
    } catch (err) {
      logger.error({ err }, 'Queue health check failed');
      return false;
    }
  };
};

/**
 * Gracefully close all registered queues and workers
 * For use with LifecycleManager
 */
export const closeAllQueues = async (): Promise<void> => {
  try {
    logger.info('Closing all queues...');

    await Promise.all(
      Object.entries(registeredQueues).map(
        async ([name, { queue, worker }]) => {
          try {
            await worker.close();
            await queue.close();
            logger.debug({ queueName: name }, 'Queue closed');
          } catch (err) {
            logger.error({ queueName: name, err }, 'Error closing queue');
          }
        },
      ),
    );

    logger.info('All queues closed');
  } catch (err) {
    throw new QueueError('Failed to close queues', err);
  }
};
