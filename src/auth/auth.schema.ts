import z from 'zod';

const baseAuthSchema = {
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email is not valid' }),
  password: z.string({ required_error: 'Password is required' }).min(8).max(64),
};

export const setPasswordSchema = z
  .object({
    token: z.string({ required_error: 'token is required' }).min(1),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must contain atleast 8 characters')
      .max(64, 'Password should not contain more than 64 characters'),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' })
      .min(8, 'Password must contain atleast 8 characters')
      .max(64, 'Password should not contain more than 64 characters'),
  })
  .refine(
    (values) => values.confirmPassword === values.password,
    'Password and confirm password must be same',
  );

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'token is required' }).min(1),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must contain atleast 8 characters')
    .max(64, 'Password should not contain more than 64 characters'),
  confirmPassword: z
    .string({ required_error: 'Confirm password is required' })
    .min(8, 'Password must contain atleast 8 characters')
    .max(64, 'Password should not contain more than 64 characters'),
});

export const registerCompanySchema = z.object({
  ...baseAuthSchema,
  name: z.string({ required_error: 'Name is required' }),
  companyName: z.string({ required_error: 'Company name is required' }).min(1),
  country: z.string({ required_error: 'Country is required' }).min(1),
  city: z.string({ required_error: 'City is required' }).min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'Password must contain atleast 8 characters')
    .max(64, 'Password should not contain more than 64 characters'),
});

export const forgetPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email must be valid' }),
});

export const registerUserSchema = z.object({
  ...baseAuthSchema,
  name: z.string({ required_error: 'Name is required' }),
  companyId: z.string().min(1).transform(Number),
});

export const loginUserSchema = z.object({
  ...baseAuthSchema,
});

export type RegisterCompanySchemaType = z.infer<typeof registerCompanySchema>;
export type RegisterUserSchemaType = z.infer<typeof registerUserSchema>;
export type LoginUserSchemaType = z.infer<typeof loginUserSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
export type ForgetPasswordSchemaType = z.infer<typeof forgetPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
export type SetPasswordSchemaType = z.infer<typeof setPasswordSchema>;
