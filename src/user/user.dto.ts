import z from 'zod';
import { definePaginatedResponse } from '../common/common.utils';
import {
  ROLE_ENUM,
  RoleType,
  SOCIAL_ACCOUNT_ENUM,
  SocialAccountType,
} from '../enums';

const SocialAccountTypeZ = z.enum(
  Object.keys(SOCIAL_ACCOUNT_ENUM) as [SocialAccountType],
);
const RoleTypeZ = z.enum(Object.keys(ROLE_ENUM) as [RoleType]);

const socialAccountInfoSchema = z.object({
  accountType: SocialAccountTypeZ,
  accessToken: z.string(),
  tokenExpiry: z.date(),
  refreshToken: z.string().optional(),
  accountID: z.string(),
});

const userOutSchema = z.object({
  email: z.string().email().optional(),
  tempEmail: z.string().email().optional(),
  avatar: z.string().url().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: RoleTypeZ,
  dob: z.union([z.date(), z.string()]).optional(),
  phoneNo: z.string().optional(),

  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  streetAddress: z.string().optional(),
  postalCode: z.string().optional(),
  interest: z.string().optional(),

  socialAccount: z.array(socialAccountInfoSchema).optional(),
  updatedAt: z.date().optional(),
  createdAt: z.date().optional(),
});

const userSchema = userOutSchema.extend({
  tempPhoneNo: z.string().optional(),
  otp: z.string().nullable().optional(),
  loginOtp: z.string().optional(),
  updateOtp: z.string().optional(),
  isActive: z.boolean(),
  password: z.string(),
  passwordResetCode: z.string().optional(),
  setPasswordCode: z.string().optional(),
  fcmToken: z.string().optional(),
});

export const usersPaginatedSchema = definePaginatedResponse(userOutSchema);

export type UserType = z.infer<typeof userSchema>;
export type SocialAccountInfoType = z.infer<typeof socialAccountInfoSchema>;
export type UserPaginatedType = z.infer<typeof usersPaginatedSchema>;
