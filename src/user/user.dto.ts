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
  _id: z.string().optional(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  name: z.string().optional(),
  username: z.string(),
  role: RoleTypeZ,
  phoneNo: z.string().optional(),
  socialAccount: z.array(socialAccountInfoSchema).optional(),
  updatedAt: z.date().optional(),
  createdAt: z.date().optional(),
});

const userSchema = userOutSchema.extend({
  otp: z.string().nullable().optional(),
  password: z.string(),
  passwordResetCode: z.string().optional(),
});

export const usersPaginatedSchema = definePaginatedResponse(userOutSchema);

export type UserType = z.infer<typeof userSchema>;
export type SocialAccountInfoType = z.infer<typeof socialAccountInfoSchema>;
export type UserPaginatedType = z.infer<typeof usersPaginatedSchema>;
