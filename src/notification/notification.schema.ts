import z from 'zod';

export const NotificationFCMTokenSchema = z.object({
  fcmToken: z.string({ message: 'FCM token is requored' }),
});

export type NotificationFCMTokenSchemaType = z.infer<
  typeof NotificationFCMTokenSchema
>;
