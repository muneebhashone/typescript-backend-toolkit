import validator from 'validator';
import z from 'zod';

export const houseRuleIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

export const houseRuleCreateOrUpdateSchema = z.object({
  rule: z.string(),
});

export type HouseRuleIdSchemaType = z.infer<typeof houseRuleIdSchema>;
export type HouseRuleCreateOrUpdateSchemaType = z.infer<
  typeof houseRuleCreateOrUpdateSchema
>;
