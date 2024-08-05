import { Queue } from '../lib/queue.server';
import { INotification } from '../notification/notification.model';

export interface NotificationQueuePayloadType extends INotification {
  bookingId?: string
}

export const NotificationQueue = Queue<NotificationQueuePayloadType>(
  'NotificationQueue',
  async (job) => {
    try {
      const { data } = job;
      const { notificationType } = data;

      return true;
    } catch (err) {
      throw err;
    }
  },
);

export const addNotificationJob = async (
  data: NotificationQueuePayloadType,
) => {
  await NotificationQueue.add('sendNotification', data);
};

const addNotificationToBatch = async () => {};
