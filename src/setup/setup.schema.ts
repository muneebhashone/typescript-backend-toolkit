import validator from 'validator';
import z from 'zod';

export const baseIdSchema = z
  .string({ required_error: 'id is required' })
  .min(1)
  .refine((value) => validator.isNumeric(value), 'id must be valid')
  .transform(Number);

export const countryIdSchema = z.object({
  countryId: baseIdSchema,
});

export const stateIdSchema = z.object({
  stateId: baseIdSchema,
});

export type CountryIdSchemaType = z.infer<typeof countryIdSchema>;
export type StateIdSchemaType = z.infer<typeof stateIdSchema>;
