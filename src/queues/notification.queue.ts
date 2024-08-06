import { Queue } from '../lib/queue.server';
import { INotification } from '../notification/notification.model';
import { sendNotifications } from '../notification/notification.service';

export interface NotificationQueuePayloadType
  extends Omit<INotification, 'isRead'> {
  bookingId?: string;
}

export const notificationQueue = Queue<NotificationQueuePayloadType>(
  'NotificationQueue',
  async (job) => {
    const { data } = job;
    await sendNotifications(data);

    return true;
  },
);

export const addNotificationJob = async (
  data: NotificationQueuePayloadType,
) => {
  await notificationQueue.add('sendNotification', data);
};
