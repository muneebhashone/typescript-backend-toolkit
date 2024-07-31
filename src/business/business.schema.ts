import validator from 'validator';
import z from 'zod';

export const businessIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

export const businessCreateOrUpdateSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name should contain atleast 3 characters')
    .transform((value) => value.toLowerCase()),
});

export type BusinessIdSchemaType = z.infer<typeof businessIdSchema>;
export type BusinessCreateOrUpdateSchemaType = z.infer<
  typeof businessCreateOrUpdateSchema
>;
