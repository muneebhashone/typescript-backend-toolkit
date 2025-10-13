import {
  type SendResetPasswordTypePayload,
  sendResetPasswordEmail,
} from '../email/email.service';
import logger from '../observability/logger';
import { Queue } from '../lib/queue.server';

export const ResetPasswordQueue = Queue<SendResetPasswordTypePayload>(
  'ResetPasswordQueue',
  async (job) => {
    try {
      const { data } = job;

      await sendResetPasswordEmail({
        ...data,
      });

      return true;
    } catch (err) {
      if (err instanceof Error) logger.error(err.message);

      throw err;
    }
  },
);
