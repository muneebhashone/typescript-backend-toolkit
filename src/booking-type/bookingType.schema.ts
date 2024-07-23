import validator from 'validator';
import z from 'zod';

export const bookingTypeIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isAlphanumeric(value), 'ID must be valid')
    .transform(Number),
});

export const bookingTypeCreateOrUpdateSchema = z.object({
  name: z.string().max(100),
  description: z.string().optional(),
});

export type BookingTypeIdSchemaType = z.infer<typeof bookingTypeIdSchema>;
export type BookingTypeCreateOrUpdateSchemaType = z.infer<
  typeof bookingTypeCreateOrUpdateSchema
>;
