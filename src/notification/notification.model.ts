import mongoose, { Schema, Document } from 'mongoose';
import {
  TYPE_OF_NOTIFICATION,
  TYPE_OF_NOTIFICATION_UNION,
} from './notification.constants';
import { BusinessTypes, BusinessTypesUnion } from '../types';

export interface INotification {
  title: string;
  message: string;
  sender?: mongoose.Schema.Types.ObjectId;
  notificationType: TYPE_OF_NOTIFICATION_UNION;
  recievers: mongoose.Schema.Types.ObjectId[];
  businessType?: BusinessTypesUnion;
}

export interface INotificationDocument extends INotification, Document {}
const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    notificationType: {
      type: String,
      enum: Object.keys(TYPE_OF_NOTIFICATION),
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    recievers: [
      {
        type: mongoose.Schema.Types,
        ref: 'User',
        required: true,
      },
    ],
    businessType: {
      type: String,
      enum: Object.keys(BusinessTypes),
      required: true,
      default: null,
    },
  },
  { timestamps: true },
);

export const Notification = mongoose.model<INotification>(
  'Notification',
  NotificationSchema,
);
