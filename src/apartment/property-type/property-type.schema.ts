import validator from 'validator';
import z from 'zod';

export const propertyTypeIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

export const propertyTypeCreateOrUpdateSchema = z.object({
  type: z.string(),
});

export type PropertyTypeIdSchemaType = z.infer<typeof propertyTypeIdSchema>;
export type PropertyTypeCreateOrUpdateSchemaType = z.infer<
  typeof propertyTypeCreateOrUpdateSchema
>;
