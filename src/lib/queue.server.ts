import type { Processor } from "bullmq";
import { Queue as BullQueue, Worker } from "bullmq";

import logger from "./logger.service";
import redisClient from "./redis.server";

type RegisteredQueue = {
	queue: BullQueue;
	worker: Worker;
};

declare global {
	// eslint-disable-next-line no-var
	var __registeredQueues: Record<string, RegisteredQueue> | undefined;
}

if (!global.__registeredQueues) {
	global.__registeredQueues = {};
}
const registeredQueues = global.__registeredQueues;

export function Queue<Payload>(
	name: string,
	handler: Processor<Payload>,
): BullQueue<Payload> {
	if (registeredQueues[name]) {
		return registeredQueues[name].queue as BullQueue<Payload>;
	}

	const queue = new BullQueue<Payload>(name, { connection: redisClient });

	const worker = new Worker<Payload>(name, handler, {
		connection: redisClient,
	});

	registeredQueues[name] = { queue, worker };

	logger.info({ name: "Queue" }, `${name}: Initialize`);

	return queue;
}
