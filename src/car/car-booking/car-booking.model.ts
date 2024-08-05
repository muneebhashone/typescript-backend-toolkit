import mongoose from 'mongoose';
import { CarBookingTypes, CarBookingTypesUnion } from './car-booking-types';
import { IGeoJSONPoint, ICarBooking } from './car-booking-types';
import {
  BookingPaymentStatus,
  BookingPaymentStatusUnion,
  BookingStatus,
  BookingStatusUnion,
} from '../../types';

// Schema for GeoJSONPoint
const GeoJSONPointSchema = new mongoose.Schema<IGeoJSONPoint>({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function (value: [number, number]) {
        return value.length === 2;
      },
      message: 'Coordinates must be an array of two numbers',
    },
  },
});

// Schema for CarBooking
const CarBookingSchema = new mongoose.Schema<ICarBooking>(
  {
    from: {
      type: GeoJSONPointSchema,
      required: true,
    },
    to: {
      type: GeoJSONPointSchema,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    pickupTime: {
      type: Date,
      required: true,
    },
    bodyguards: {
      type: Number,
      required: true,
    },
    bookingType: {
      type: String,
      enum: Object.keys(CarBookingTypes) as CarBookingTypesUnion[],
      required: true,
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Car',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    bookingStatus: {
      type: String,
      enum: Object.keys(BookingStatus) as BookingStatusUnion[],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.keys(BookingPaymentStatus) as BookingPaymentStatusUnion[],
      required: true,
    },
    totalMiles: {
      type: Number,
      required: true,
    },
    pickupFee: {
      type: Number,
      required: true,
    },
    standardProtection: {
      type: Boolean,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

// Create and export Mongoose model
export const CarBooking = mongoose.model<ICarBooking>(
  'CarBooking',
  CarBookingSchema,
);
