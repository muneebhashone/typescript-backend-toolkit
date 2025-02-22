import validator from "validator";
import z from "zod";
import { passwordValidationSchema } from "../../common/common.schema";
import { baseCreateUser } from "../user/user.schema";

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
