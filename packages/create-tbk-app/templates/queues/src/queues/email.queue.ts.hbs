import {
  type SendResetPasswordTypePayload,
  sendResetPasswordEmail,
} from '../email/email.service';
import logger from '@/plugins/logger';
import { Queue } from '../lib/queue';

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
