import { ApartmentBooking } from '../apartment/apartment-booking/apartment-booking.model';
import { CarBooking } from '../car/car-booking.model';
import fbAdmin from '../lib/fcm';
import User from '../models/users';
import { NotificationQueuePayloadType } from '../queues/notification.queue';
import { INotification } from './notification.model';
import Batch from 'batch';

export const sendNotifications = async (data: NotificationQueuePayloadType) => {
  const { recievers, sender } = data;

  const users = await fetchUsersForNotification(data);

  const batch = new Batch();
  batch.concurrency(5); // Number of concurrent batch processes

  users.forEach((user) => {
    batch.push(async (done) => {
      try {
        const messages = {
          token: user.fcmToken,
          notification: {
            title: data.title,
            body: data.message,
          },
        };

        await fbAdmin.messaging().send(messages);
        await storeNotificationInDB(user._id, notificationType, data); // Store notification in DB
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
  return await User.find({}).select('fcmToken');
};

const fetchBookingUsers = async (data: NotificationQueuePayloadType) => {
  switch (data.businessType) {
    case 'apartment':
      const apartmentBooking = await ApartmentBooking.findById(data.bookingId);
      return User.find({
        _id: { $in: [apartmentBooking?.apartmentOwner] },
      }).select('fcmToken');
    case 'car':
      const carBooking = await CarBooking.findById(data.bookingId);
      return User.find({ _id: { $in: [carBooking?.owner] } }).select(
        'fcmToken',
      );
    default:
      return [];
  }
};

const fetchChatUsers = async (data: NotificationQueuePayloadType) => {};
