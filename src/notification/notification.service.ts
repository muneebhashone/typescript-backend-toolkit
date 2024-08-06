import { ApartmentBooking } from '../apartment/apartment-booking/apartment-booking.model';
import { CarBooking } from '../car/car-booking/car-booking.model';
import fbAdmin from '../lib/fcm';
import User from '../user/user.model';
import { NotificationQueuePayloadType } from '../queues/notification.queue';
import { INotification, Notification } from './notification.model';
import Batch from 'batch';
import { NotificationFCMTokenSchemaType } from './notification.schema';
import { rolesEnums } from '../enums';

export const setFCMToken = async (
  payload: NotificationFCMTokenSchemaType & { userId: string },
): Promise<void> => {
  await fbAdmin.auth().verifyIdToken(payload.fcmToken);
  const tokenSet = await User.findByIdAndUpdate(payload.userId, {
    $set: {
      fcmToken: payload.fcmToken,
    },
  });

  if (!tokenSet) {
    throw new Error('Invalid User ID, or server error');
  }
};

export const sendNotifications = async (data: NotificationQueuePayloadType) => {
  const users = await fetchUsersForNotification(data);

  const batch = new Batch();
  batch.concurrency(5);

  users.forEach((user, i) => {
    batch.push(async (done) => {
      try {
        const messages = {
          token: user.fcmToken as string,
          notification: {
            title: data.title,
            body: data.message,
          },
        };

        const promises = [
          fbAdmin.messaging().send(messages),
          storeNotificationInDB({
            ...data,
            sender: null,
            recievers: users.map((user) => user.id),
            isRead: false,
          }),
        ];

        await Promise.all(promises);

        done(null, `Notification sent to user ${user._id}`);
      } catch (error) {
        console.error(`Error sending notification to user ${user._id}:`, error);
        done(error);
      }
    });
  });

  batch.end((err) => {
    if (err) console.error('Batch processing error:', err);
    console.log(`Notifications processed for ${users.length} users`);
  });
};

const fetchUsersForNotification = async (
  data: NotificationQueuePayloadType,
) => {
  switch (data.notificationType) {
    case 'SYSTEM_NOTIFICATION':
      return await fetchAllUsers();
    case 'BOOKING_NOTIFICATION':
      return await fetchBookingUsers(data);
    case 'CHAT_NOTIFICATION':
      return [];
    default:
      return [];
  }
};

const fetchAllUsers = async () => {
  return await User.find({
    role: {
      $nin: [rolesEnums[1]],
    },
  }).select('fcmToken id');
};

const fetchBookingUsers = async (data: NotificationQueuePayloadType) => {
  switch (data.businessType) {
    case 'apartment': {
      const booking = await ApartmentBooking.findById(data.bookingId);
      return User.find({
        _id: booking?.apartmentOwner,
      }).select('fcmToken id');
    }
    case 'car': {
      const booking = await CarBooking.findById(data.bookingId);
      return User.find({ _id: booking?.owner }).select('fcmToken id');
    }
    default: {
      return [];
    }
  }
};

const storeNotificationInDB = async (data: INotification) => {
  try {
    const notification = await Notification.create({ ...data });
    await notification.save();
  } catch (error) {
    console.error('Error storing notification in DB:', error);
  }
};
