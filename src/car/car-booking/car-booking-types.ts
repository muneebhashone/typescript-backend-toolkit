import mongoose from 'mongoose';
import { BookingPaymentStatusUnion, BookingStatusUnion } from '../../types';

export const CarBookingTypes = {
  one_way: 'one_way',
  round_trip: 'round_trip',
  multiple_route: 'multiple_route',
};

export type CarBookingTypesUnion = keyof typeof CarBookingTypes;

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface ICarBooking {
  from: IGeoJSONPoint;
  to: IGeoJSONPoint;
  pickupAddress: string;
  destination: string;
  pickupDate: Date;
  pickupTime: Date;
  bodyguards: number;
  bookingType: CarBookingTypesUnion;
  carId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bookingStatus: BookingStatusUnion;
  paymentStatus: BookingPaymentStatusUnion;
  totalMiles: number;
  pickupFee: number;
  standardProtection: boolean;
  discount: number;
  tax: number;
  amount: number;
  total: number;
  confirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
