import z from "zod";
import { definePaginatedResponse } from "../../common/common.utils";
import {
	ROLE_ENUM,
	type RoleType,
	SOCIAL_ACCOUNT_ENUM,
	type SocialAccountType,
} from "../../enums";

export const SocialAccountTypeZ = z.enum(
	Object.keys(SOCIAL_ACCOUNT_ENUM) as [SocialAccountType],
);

export const RoleTypeZ = z.enum(Object.keys(ROLE_ENUM) as [RoleType]);

export const socialAccountInfoSchema = z.object({
	accountType: SocialAccountTypeZ,
	accessToken: z.string(),
	tokenExpiry: z.date(),
	refreshToken: z.string().optional(),
	accountID: z.string(),
});

export const userOutSchema = z.object({
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

export const userSchema = userOutSchema.extend({
	otp: z.string().nullable().optional(),
	password: z.string(),
	passwordResetCode: z.string().optional().nullable(),
});

export const usersPaginatedSchema = definePaginatedResponse(userOutSchema);

export type UserModelType = z.infer<typeof userSchema>;
export type UserType = z.infer<typeof userSchema> & { id: string; _id: string };
export type SocialAccountInfoType = z.infer<typeof socialAccountInfoSchema>;
export type UserPaginatedType = z.infer<typeof usersPaginatedSchema>;
