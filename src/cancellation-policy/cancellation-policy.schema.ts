import validator from 'validator';
import z from 'zod';

export const cancellationPolicyIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isAlphanumeric(value), 'ID must be valid')
    .transform(Number),
});

export const cancellationPolicyCreateOrUpdateSchema = z.object({
  policy: z.string(),
  description: z.string().optional(),
});

export type CancellationPolicyIdSchemaType = z.infer<
  typeof cancellationPolicyIdSchema
>;
export type CancellationPolicyCreateOrUpdateSchemaType = z.infer<
  typeof cancellationPolicyCreateOrUpdateSchema
>;
