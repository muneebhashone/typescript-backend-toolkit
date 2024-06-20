import * as z from 'zod';
import { permissionEnums, rolesEnums, statusEnums } from '../drizzle/enums';
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

export const createClientUserSchema = z.object({
  ...baseCreateUser,
});

export const createClientSuperUserSchema = z.object({
  ...baseCreateUser,
});

export const createWhiteLabelAdminSchema = z.object({
  ...baseCreateUser,
  companyName: z.string({ required_error: 'Company name is required' }).min(1),
  country: z.string({ required_error: 'Country is required' }).min(1),
  city: z.string({ required_error: 'City is required' }).min(1),
});

export const createWhiteLabelSubAdminSchema = z.object({
  ...baseCreateUser,
});

export const createSubAdminSchema = z.object({
  ...baseCreateUser,
});

export const userStatusSchema = z.object({
  status: z.enum(statusEnums, { required_error: 'Status is required' }),
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

export const userPermissionsSchema = z.object({
  permissions: z.enum(permissionEnums).array(),
});

export const assignCreditsSchema = z.object({
  credits: z.number().min(0),
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
  filterByStatus: z.enum(statusEnums).optional(),
  filterByRole: z.enum(rolesEnums).optional(),
});

export type CreateClientUserSchemaType = z.infer<typeof createClientUserSchema>;
export type CreateClientSuperUserSchema = z.infer<
  typeof createClientSuperUserSchema
>;
export type CreateWhiteLabelAdminSchema = z.infer<
  typeof createWhiteLabelAdminSchema
>;
export type CreateWhiteLabelSubAdminSchema = z.infer<
  typeof createWhiteLabelSubAdminSchema
>;
export type CreateSubAdminSchema = z.infer<typeof createSubAdminSchema>;
export type GetUsersSchemaType = z.infer<typeof getUsersSchema>;
export type UserStatusSchemaType = z.infer<typeof userStatusSchema>;
export type UserIdSchemaType = z.infer<typeof userIdSchema>;
export type BulkUserIdSchemaType = z.infer<typeof bulkUserIdsSchema>;
export type UserPermissionsSchemaType = z.infer<typeof userPermissionsSchema>;
export type AssignCreditsSchemaType = z.infer<typeof assignCreditsSchema>;
