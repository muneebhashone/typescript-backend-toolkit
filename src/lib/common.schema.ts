import { HttpStatusCode } from 'axios';
import z from 'zod';

export const searchAndPaginationSchema = z.object({
  search: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export const returnMessageSchema = z.object({
  status: z
    .number()
    .refine((value) => Object.values(HttpStatusCode).includes(value)),
  message: z.string(),
});

export type ReturnMessageSchema = z.infer<typeof returnMessageSchema>;
