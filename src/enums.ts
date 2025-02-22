export const ROLE_ENUM = {
	DEFAULT_USER: "DEFAULT_USER",
	SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export const SOCIAL_ACCOUNT_ENUM = {
	GOOGLE: "GOOGLE",
	FACEBOOK: "FACEBOOK",
	APPLE: "APPLE",
} as const;

export type SocialAccountType = keyof typeof SOCIAL_ACCOUNT_ENUM;
export type RoleType = keyof typeof ROLE_ENUM;
