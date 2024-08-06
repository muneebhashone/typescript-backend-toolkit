import { StatusCodes } from 'http-status-codes';
import z from 'zod';
import { BusinessTypes } from '../types';

export const searchAndPaginationSchema = z.object({
  search: z.string().optional(),
  page: z.string().default('1').transform(Number).optional(),
  limit: z.string().default('10').transform(Number).optional(),
});

export const returnMessageSchema = z.object({
  status: z
    .number()
    .refine((value) => Object.values(StatusCodes).includes(value)),
  message: z.string(),
});

export const businessTypesSchema = z.enum(
  Object.keys(BusinessTypes) as [keyof typeof BusinessTypes],
);

export type BusinessTypesSchemaType = z.infer<typeof businessTypesSchema>;
export type ReturnMessageSchemaType = z.infer<typeof returnMessageSchema>;
