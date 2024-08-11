import validator, { isMongoId } from 'validator';
import * as z from 'zod';
import { ROLE_ENUM, RoleType } from '../enums';
import {
  isTransformableToBoolean,
  stringToBoolean,
  transformableToBooleanError,
} from '../utils/common.utils';

export const baseCreateUser = {
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email is not valid' })
    .optional(),
  name: z.string({ required_error: 'Name is required' }).min(1).optional(),
};

export const createUserSchema = z.object({
  ...baseCreateUser,
  firstName: z.string({ required_error: 'First name is required' }).min(1),
  lastName: z
    .string({ required_error: 'Last na`me is required' })
    .min(1)
    .optional(),
  phoneNo: z
    .string({ required_error: 'Phone number is required' })
    .min(6, 'Phone number must atleast contains 6 characters')
    .max(15, 'Phone number should not be greater than 15 characters')
    .optional(),
  dob: z
    .string({ required_error: 'Birthday is required' })
    .date("Date must be formated as 'YYYY-MM-DD'")
    .optional(),
});

export const updateUserEmailSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email is not valid' }),
});

export const updateUserPhoneNoSchema = z.object({
  phoneNo: z
    .string({ required_error: 'Phone No is required' })
    .refine(
      (value) => validator.isMobilePhone(value, 'any', { strictMode: true }),
      'Phone no. is not valid',
    ),
});

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    dob: z.string().date("Date must be formated as 'YYYY-MM-DD'").optional(),
    name: z.string().min(1).nullable().optional(),
    country: z
      .string({ required_error: 'Country is required' })
      .min(1)

      .optional(),
    city: z
      .string({ required_error: 'City is required' })
      .min(1)

      .optional(),
    state: z
      .string({ required_error: 'State is required' })
      .min(1)

      .optional(),
    streetAddress: z
      .string({ required_error: 'Street Address is required' })
      .min(1)

      .optional(),
    postalCode: z
      .string()
      .refine((value) => validator.isPostalCode(value, 'any'))

      .optional(),
    interest: z
      .string()
      .refine((value) => validator.isMongoId(value))
      .optional(),
  })
  .strict();

export const setUserLocationSchema = z.object({
  country: z.string({ required_error: 'Country is required' }).min(1),
  city: z.string({ required_error: 'City is required' }).min(1),
  state: z.string({ required_error: 'State is required' }).min(1),
  streetAddress: z
    .string({ required_error: 'Street Address is required' })
    .min(1),
  postalCode: z
    .string()
    .refine((value) => validator.isPostalCode(value, 'any'))
    .nullable(),
});

export const userIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

export const bulkUserIdsSchema = z.object({
  ids: z
    .string()
    .array()
    .refine(
      (values) => values.every((value) => isMongoId(value)),
      'Ids must be string-integer',
    ),
});

export const verifyUpdateOtpSchema = z.object({
  code: z
    .string({ required_error: 'code is required' })
    .min(4)
    .max(4)
    .refine((value) => validator.isAlphanumeric(value)),
  for: z.enum(['email', 'phone'], {
    required_error: "for must be one of ['email','phone']",
  }),
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
    .default('true')
    .refine(isTransformableToBoolean, transformableToBooleanError)
    .transform(stringToBoolean),
  filterByRole: z.enum(Object.keys(ROLE_ENUM) as [RoleType]).optional(),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
export type GetUsersSchemaType = z.infer<typeof getUsersSchema>;
export type UserIdSchemaType = z.infer<typeof userIdSchema>;
export type BulkUserIdSchemaType = z.infer<typeof bulkUserIdsSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;

export type UpdateUserEmailSchemaType = z.infer<typeof updateUserEmailSchema>;
export type UpdateUserPhoneSchemaType = z.infer<typeof updateUserPhoneNoSchema>;

export type VerifyUpdateOtpSchemaType = z.infer<typeof verifyUpdateOtpSchema>;
