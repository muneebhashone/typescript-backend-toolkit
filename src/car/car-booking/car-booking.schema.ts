import validator from 'validator';
import z from 'zod';
import { CarBookingTypes } from '../car-booking-types';

// Define the Zod schema for GeoJSONPoint
export const GeoJSONPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
});

// Define the Zod schema for CarBooking
export const CarBookingSchema = z.object({
  from: GeoJSONPointSchema,
  to: GeoJSONPointSchema,
  pickupAddress: z.string().max(255),
  destination: z.string().max(255),
  pickupDate: z.string().date(),
  pickupTime: z.string().datetime(),
  bodyguards: z.number().int().nonnegative(),
  bookingType: z.enum(
    Object.keys(CarBookingTypes) as [keyof typeof CarBookingTypes],
  ),
  carId: z.string().refine((value) => validator.isMongoId(value), {
    message: 'Invalid ObjectId',
  }),
  userId: z.string().refine((value) => validator.isMongoId(value), {
    message: 'Invalid ObjectId',
  }),
  discount: z.number().nonnegative(),
});

export const carBookingIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

// Export types for usage
export type GeoJSONPointSchemaType = z.infer<typeof GeoJSONPointSchema>;
export type CarBookingSchemaType = z.infer<typeof CarBookingSchema>;
export type CarBookingIdSchemaType = z.infer<typeof carBookingIdSchema>;
