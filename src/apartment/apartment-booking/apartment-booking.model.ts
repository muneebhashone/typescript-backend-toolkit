import mongoose, { Document, Schema } from 'mongoose';
import {
  BookingPaymentStatus,
  BookingPaymentStatusUnion,
  BookingStatus,
  BookingStatusUnion,
} from '../../types';

export interface IApartmentBooking {
  checkIn: Date;
  checkOut: Date;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfPets: number;
  noteToOwner: string;
  apartment: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  billingCard: mongoose.Schema.Types.ObjectId;
  discount: mongoose.Schema.Types.ObjectId;
  apartmentOwner: mongoose.Schema.Types.ObjectId;
  confirmed: boolean;
  termsAccepted: boolean;
  status: BookingStatusUnion;
  paymentStatus: BookingPaymentStatusUnion;
}

export interface IApartmentBookingDocument
  extends IApartmentBooking,
    Document {}

const ApartmentBookingSchema = new Schema<IApartmentBooking>(
  {
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    numberOfAdults: {
      type: Number,
      default: 0,
    },
    numberOfChildren: {
      type: Number,
      default: 0,
    },
    numberOfPets: {
      type: Number,
      default: 0,
    },
    noteToOwner: {
      type: String,
      required: false,
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
    },
    billingCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BillingCard',
      required: false,
    },
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
      required: true,
    },
    apartmentOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    confirmed: {
      type: Boolean,
      required: false,
      default: false,
    },
    termsAccepted: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: {
      type: String,
      enum: Object.keys(BookingStatus) as BookingStatusUnion[],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.keys(BookingPaymentStatus) as BookingPaymentStatusUnion[],
      required: true,
    },
  },
  { timestamps: true },
);

export const ApartmentBooking = mongoose.model<IApartmentBooking>(
  'ApartmentBooking',
  ApartmentBookingSchema,
);
