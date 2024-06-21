import * as z from 'zod';
import { rolesEnums } from '../drizzle/enums';
import {
  isTransformableToBoolean,
  stringToBoolean,
  transformableToBooleanError,
} from '../utils/common.utils';

const baseCreateUser = {
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email is not valid' }),
  name: z.string({ required_error: 'Name is required' }),
};

export const createUserSchema = z.object({
  ...baseCreateUser,
  firstName: z.string({ required_error: 'Name is required' }).min(1),
  lastName: z.string({ required_error: 'Name is required' }).min(1),
  phoneNo: z
    .string({ required_error: 'Phone number is required' })
    .min(6, 'Phone number must atleast contains 6 characters'),
  phoneCountry: z.string({ required_error: 'Phone Country is required' }),
  dob: z
    .string({ required_error: 'Birthday is required' })
    .date("Date must be formated as 'YYYY-MM-DD'"),
});

export const userIdSchema = z.object({
  id: z.string().transform(Number),
});

export const bulkUserIdsSchema = z.object({
  ids: z
    .string()
    .array()
    .refine(
      (values) => values.every((value) => !isNaN(Number(value))),
      'Ids must be string-integer',
    )
    .transform((values) => values.map(Number)),
});

export const getUsersSchema = z.object({
  searchString: z.string().optional(),
  limitParam: z
    .string()
    .default('10')
    .refine(
      (value) => !isNaN(Number(value)) && Number(value) >= 0,
      'Input must be positive integer',
    )
    .transform(Number),
  pageParam: z
    .string()
    .default('1')
    .refine(
      (value) => !isNaN(Number(value)) && Number(value) >= 0,
      'Input must be positive integer',
    )
    .transform(Number),
  filterByActive: z
    .string()
    .default('false')
    .refine(isTransformableToBoolean, transformableToBooleanError)
    .transform(stringToBoolean),
  filterByRole: z.enum(rolesEnums).optional(),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
export type GetUsersSchemaType = z.infer<typeof getUsersSchema>;
export type UserIdSchemaType = z.infer<typeof userIdSchema>;
export type BulkUserIdSchemaType = z.infer<typeof bulkUserIdsSchema>;