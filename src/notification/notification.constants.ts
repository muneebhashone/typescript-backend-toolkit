export const TYPE_OF_NOTIFICATION = {
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
  BOOKING_NOTIFICATION: 'USER_NOTIFICATION',
  CHAT_NOTIFICATION: 'CHAT_NOTIFICATION',
} as const;

export type TYPE_OF_NOTIFICATION_UNION = keyof typeof TYPE_OF_NOTIFICATION;

export const NOTIFICATION_TITLE = {
  YOUR_PURCHASE_IS_DONE: 'Your Purchase Is Done!',
  NEW_LISTING: 'New Listing',
  HOME_ON_SALE: 'Home on Sale!!',
} as const;

export type NOTIFICATION_TITLE_TYPE = keyof typeof NOTIFICATION_TITLE;

export const NOTIFICATION_MESSAGES = {
  YOUR_PURCHASE_IS_DONE:
    'Apartment successfully booked. You can check your booking on the menu profile.',
  NEW_LISTING: 'A new home has just been listed on our app.',
  HOME_ON_SALE:
    'This home is currently on sale for 10% off. It is located in a quiet area, near shopping centers & restaurants.',
} as const;
export type NOTIFICATION_MESSAGES_TYPE = keyof typeof NOTIFICATION_MESSAGES;
