import validator from 'validator';
import z from 'zod';

export const discountIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isAlphanumeric(value), 'ID must be valid'),
});

export const discountCreateOrUpdateSchema = z.object({
  title: z.string(),
  description: z.string(),
  value: z.number(),
});

export type DiscountIdSchemaType = z.infer<typeof discountIdSchema>;
export type DiscountCreateOrUpdateSchemaType = z.infer<
  typeof discountCreateOrUpdateSchema
>;
