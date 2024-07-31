import validator from 'validator';
import z from 'zod';

export const facilityIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isAlphanumeric(value), 'ID must be valid'),
});

export const facilityCreateOrUpdateSchema = z.object({
  name: z.string(),
  icon: z.string().optional(),
});

export type FacilityIdSchemaType = z.infer<typeof facilityIdSchema>;
export type FacilityCreateOrUpdateSchemaType = z.infer<
  typeof facilityCreateOrUpdateSchema
>;
