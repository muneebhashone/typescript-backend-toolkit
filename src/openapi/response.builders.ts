import { z } from 'zod';
import {
  errorResponseSchema,
  paginatedResponseSchema,
  paginatorSchema,
} from '../common/common.schema';

/**
 * Response builders (R) - helpers for creating consistent response schemas
 *
 * These builders wrap data schemas in standard envelope formats that match
 * your API's response structure. Use them in router `responses` configuration.
 *
 * @example
 * // In a router:
 * router.get('/:id', {
 *   requestType: { params: idSchema },
 *   responses: {
 *     200: R.success(userSchema),
 *     404: R.error(),
 *   }
 * }, handler);
 */
export const R = {
  /**
   * Standard success response envelope
   * @param data - Zod schema for the data payload
   * @returns Schema matching { success: true, message?: string, data?: T }
   *
   * @example
   * R.success(z.object({ user: userSchema }))
   */
  success: <T extends z.ZodTypeAny>(data: T) =>
    z.object({
      success: z.literal(true),
      message: z.string().optional(),
      data: data.optional(),
    }),

  /**
   * Paginated response envelope for list endpoints
   * @param item - Zod schema for individual items in the array
   * @returns Schema with items array and paginator metadata
   *
   * @example
   * R.paginated(userSchema) // for list of users with pagination
   */
  paginated: <T extends z.ZodTypeAny>(item: T) =>
    z.object({
      success: z.literal(true),
      message: z.string().optional(),
      data: z.object({
        items: z.array(item),
        paginator: paginatorSchema,
      }),
    }),

  /**
   * No content response (204)
   * Use for successful operations that don't return data
   *
   * @example
   * responses: { 204: R.noContent() }
   */
  noContent: () => z.undefined(),

  /**
   * Error response envelope
   * @param schema - Optional custom error schema (defaults to standard error)
   * @returns Error schema matching { success: false, message: string, data: any, stack?: string }
   *
   * @example
   * R.error() // uses default error schema
   * R.error(customErrorSchema) // override with custom schema
   */
  error: <T extends z.ZodTypeAny = typeof errorResponseSchema>(schema?: T) =>
    schema ?? errorResponseSchema,

  /**
   * Raw schema passthrough (for non-standard responses)
   * Use when you need a response that doesn't fit the envelope pattern
   *
   * @example
   * R.raw(z.string()) // for raw string responses
   * R.raw(z.object({ customField: z.string() })) // custom structure
   */
  raw: <T extends z.ZodTypeAny>(schema: T) => schema,
};

/**
 * Type helper to extract the data type from a success response schema
 * @example
 * type UserData = ExtractSuccessData<typeof userResponseSchema>;
 */
export type ExtractSuccessData<T> =
  T extends z.ZodObject<infer Shape extends z.ZodRawShape>
    ? Shape extends { data: infer D }
      ? D extends z.ZodOptional<infer U>
        ? U
        : D
      : never
    : never;
