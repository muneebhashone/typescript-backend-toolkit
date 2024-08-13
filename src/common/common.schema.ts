import { z } from 'zod';

export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export const errorResponseSchema = z.object({
  message: z.string(),
  success: z.boolean().default(false),
  data: z.record(z.string(), z.any()),
  stack: z.string().optional(),
});

export const paginatorSchema = z.object({
  skip: z.number().min(0),
  limit: z.number().min(1),
  currentPage: z.number().min(1),
  pages: z.number().min(0),
  hasNextPage: z.boolean(),
  totalRecords: z.number().min(0),
  pageSize: z.number().min(1),
});

export const paginatedResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
  data: z
    .object({
      items: z.array(z.unknown()),
      paginator: paginatorSchema,
    })
    .optional(),
});
