import validator from "validator";
import z from "zod";
import { passwordValidationSchema } from "../../common/common.schema";
import { R } from "../../openapi/response.builders";
import { baseCreateUser } from "../user/user.schema";
import { userOutSchema } from "../user/user.dto";
import { sessionRecordSchema } from "./session/session.schema";

export const resetPasswordSchema = z.object({
	userId: z
		.string({ required_error: "userId is required" })
		.min(1)
		.refine((value) => validator.isMongoId(value), "userId must be valid"),
	code: z
		.string({ required_error: "code is required" })
		.min(4)
		.max(4)
		.refine((value) => validator.isAlphanumeric(value), "code must be valid"),
	password: passwordValidationSchema("Password"),
	confirmPassword: passwordValidationSchema("Confirm password"),
});

export const changePasswordSchema = z.object({
	currentPassword: passwordValidationSchema("Current password"),
	newPassword: passwordValidationSchema("New password"),
});

export const forgetPasswordSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.email("Email must be valid"),
});

export const registerUserByEmailSchema = z
	.object({
		name: z.string({ required_error: "Name is required" }).min(1),
		confirmPassword: passwordValidationSchema("Confirm Password"),
	})
	.merge(baseCreateUser)
	.strict()
	.refine(({ password, confirmPassword }) => {
		if (password !== confirmPassword) {
			return false;
		}

		return true;
	}, "Password and confirm password must be same");

export const loginUserByEmailSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.email({ message: "Email is not valid" }),
	password: z.string().min(1, "Password is required"),
});

export type RegisterUserByEmailSchemaType = z.infer<
	typeof registerUserByEmailSchema
>;

export type LoginUserByEmailSchemaType = z.infer<typeof loginUserByEmailSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
export type ForgetPasswordSchemaType = z.infer<typeof forgetPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

// Response schemas
export const loginResponseSchema = R.success(z.object({ token: z.string() }));
export const registerResponseSchema = R.success(z.object({ token: z.string() }));
export const logoutResponseSchema = R.success(z.object({
	success: z.boolean(),
	message: z.string(),
}));
export const getCurrentUserResponseSchema = R.success(userOutSchema);
export const forgetPasswordResponseSchema = R.success(z.object({ userId: z.string() }));
export const changePasswordResponseSchema = R.success(z.object({
	success: z.boolean(),
	message: z.string(),
}));
export const resetPasswordResponseSchema = R.success(z.object({
	success: z.boolean(),
	message: z.string(),
}));
export const listSessionsResponseSchema = R.success(z.array(sessionRecordSchema));
export const revokeSessionResponseSchema = R.success(z.object({
	success: z.boolean(),
	message: z.string(),
}));
export const revokeAllSessionsResponseSchema = R.success(z.object({
	success: z.boolean(),
	message: z.string(),
}));

// Response types
export type LoginResponseSchema = z.infer<typeof loginResponseSchema>;
export type RegisterResponseSchema = z.infer<typeof registerResponseSchema>;
export type LogoutResponseSchema = z.infer<typeof logoutResponseSchema>;
export type GetCurrentUserResponseSchema = z.infer<typeof getCurrentUserResponseSchema>;
export type ForgetPasswordResponseSchema = z.infer<typeof forgetPasswordResponseSchema>;
export type ChangePasswordResponseSchema = z.infer<typeof changePasswordResponseSchema>;
export type ResetPasswordResponseSchema = z.infer<typeof resetPasswordResponseSchema>;
export type ListSessionsResponseSchema = z.infer<typeof listSessionsResponseSchema>;
export type RevokeSessionResponseSchema = z.infer<typeof revokeSessionResponseSchema>;
export type RevokeAllSessionsResponseSchema = z.infer<typeof revokeAllSessionsResponseSchema>;
