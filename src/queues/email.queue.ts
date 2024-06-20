import {
  SendResetPasswordTypePayload,
  SendSetPasswordEmailTypePayload,
  SendTrackingEmailPayload,
  sendResetPasswordEmail,
  sendSetPasswordEmail,
  sendTrackingEmail,
} from '../email/email.service';
import logger from '../lib/logger.service';
import { Queue } from '../lib/queue.server';

export const SetPasswordEmailQueue = Queue<SendSetPasswordEmailTypePayload>(
  'SetPasswordEmailQueue',
  async (job) => {
    try {
      const { data } = job;

      await sendSetPasswordEmail({
        ...data,
      });

      return true;
    } catch (err) {
      if (err instanceof Error) logger.error(err.message);

      throw err;
    }
  },
);

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

export const TrackingEmailQueue = Queue<SendTrackingEmailPayload>(
  'TrackingEmailQueue',
  async (job) => {
    try {
      const { data } = job;

      await sendTrackingEmail({
        ...data,
      });

      return true;
    } catch (err) {
      if (err instanceof Error) logger.error(err.message);

      throw err;
    }
  },
);
