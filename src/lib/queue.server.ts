import type { Processor, QueueOptions, WorkerOptions } from 'bullmq';
import { Queue as BullQueue, Worker } from 'bullmq';

import logger from '../observability/logger';
import redisClient from './redis.server';

type RegisteredQueue = {
  queue: BullQueue;
  worker: Worker;
};

export const registeredQueues: Record<string, RegisteredQueue> = {};

export function Queue<Payload>(
  name: string,
  handler: Processor<Payload>,
  queueOptions?: QueueOptions,
  workerOptions?: WorkerOptions,
): BullQueue<Payload> {
  if (registeredQueues[name]) {
    return registeredQueues[name].queue as BullQueue<Payload>;
  }

  const queue = new BullQueue<Payload>(name, {
    connection: redisClient,
    ...queueOptions,
  });

  const worker = new Worker<Payload>(name, handler, {
    connection: redisClient,
    ...workerOptions,
  });

  registeredQueues[name] = { queue, worker };

  logger.info({ name: 'Queue' }, `${name}: Initialize`);

  return queue;
}
