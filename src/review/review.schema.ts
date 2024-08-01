import z from 'zod';
import validator from 'validator';
import { BusinessTypes } from './review.types';

// Define the BusinessTypes enum
export const businessTypesSchema = z.enum(
  Object.keys(BusinessTypes) as [keyof typeof BusinessTypes],
);

// Define the ReviewType schema
export const reviewTypeSchema = z.object({
  name: z.string().max(255),
  value: z.number().min(0).max(5),
});

export const reviewIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

export const reviewRefIdSchema = z.object({
  refId: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

// Define the Review schema
export const reviewSchema = z.object({
  reviewerId: z.string().refine((value) => validator.isMongoId(value), {
    message: 'Invalid ObjectId',
  }),
  comment: z.string().max(1000),
  refId: z.string().refine((value) => validator.isMongoId(value), {
    message: 'Invalid ObjectId',
  }),
  businessType: businessTypesSchema,
  reviewTypes: z.array(reviewTypeSchema).min(1),
});

// Exporting types for usage
export type BusinessTypesSchemaType = z.infer<typeof businessTypesSchema>;
export type ReviewTypeSchemaType = z.infer<typeof reviewTypeSchema>;
export type ReviewSchemaType = z.infer<typeof reviewSchema>;
export type ReviewIdSchemaType = z.infer<typeof reviewIdSchema>;
export type ReviewRefIdSchemaType = z.infer<typeof reviewRefIdSchema>;
