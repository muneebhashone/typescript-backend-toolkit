import validator from 'validator';
import z from 'zod';

export const typeOfPlaceIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isAlphanumeric(value), 'ID must be valid'),
});

export const typeOfPlaceCreateOrUpdateSchema = z.object({
  type: z.string(),
});

export type TypeOfPlaceIdSchemaType = z.infer<typeof typeOfPlaceIdSchema>;
export type TypeOfPlaceCreateOrUpdateSchemaType = z.infer<
  typeof typeOfPlaceCreateOrUpdateSchema
>;
