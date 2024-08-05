import validator from 'validator';
import z from 'zod';
import { CarBookingTypes } from './car-booking-types';

// Define the Zod schema for GeoJSONPoint
export const geoJSONPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]).refine((value) => {
    return validator.isLatLong(`${value[0]},${value[1]}`);
  }, 'Coordinates must be a valid latitude and longitude'),
});

// Define the Zod schema for CarBooking
export const carBookingSchema = z.object({
  from: geoJSONPointSchema,
  to: geoJSONPointSchema,
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
  discount: z.number().nonnegative(),
});

export const carBookingIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

// Export types for usage
export type GeoJSONPointSchemaType = z.infer<typeof geoJSONPointSchema>;
export type CarBookingSchemaType = z.infer<typeof carBookingSchema>;
export type CarBookingIdSchemaType = z.infer<typeof carBookingIdSchema>;
