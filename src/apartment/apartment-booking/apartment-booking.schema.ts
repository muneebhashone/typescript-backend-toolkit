import validator from 'validator';
import z from 'zod';

export const apartmentBookingIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

export const apartmentBookingCreateOrUpdateSchema = z.object({
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  numberOfAdults: z.number().nonnegative(),
  numberOfChildren: z.number().nonnegative(),
  numberOfPets: z.number().nonnegative(),
  noteToOwner: z.string().max(255).optional(),
  apartment: z
    .string()
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
  user: z
    .string()
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
  billingCard: z
    .string()
    .refine((value) => validator.isMongoId(value), 'ID must be valid')
    .optional(),
  discount: z
    .string()
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

export const confirmApartmentBookingSchema = z
  .object({
    termsAccepted: z
      .boolean({ message: 'Terms and Conditions are required' })
      .refine((value) => value, 'Please accept Terms and Conditions'),
  })
  .merge(apartmentBookingIdSchema);

export const myBookingsSchema = z.object({
  type: z.string(),
});

export type ApartmentBookingIdSchemaType = z.infer<
  typeof apartmentBookingIdSchema
>;
export type ApartmentBookingCreateOrUpdateSchemaType = z.infer<
  typeof apartmentBookingCreateOrUpdateSchema
>;
export type ConfirmApartmentBookingSchema = z.infer<
  typeof confirmApartmentBookingSchema
>;
