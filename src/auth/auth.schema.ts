import z from 'zod';
import validator from 'validator';

const passwordValidation = (fieldName: string) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .min(8, `${fieldName} must contain atleast 8 characters`)
    .max(64, `${fieldName} should not contain more than 64 characters`)
    .refine(
      (value) =>
        validator.isStrongPassword(value, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1,
          minNumbers: 1,
        }),
      `${fieldName} must be strong, should contain 1 lowercase letter, 1 uppercase letter, 1 special character, 1 number atleast`,
    );

const baseAuthSchemaEmail = {
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email is not valid' }),
  password: passwordValidation('Password'),
};

const baseAuthSchemaPhone = {
  phoneNo: z
    .string({ required_error: 'Phone No is required' })
    .refine(
      (value) => validator.isMobilePhone(value, 'any', { strictMode: true }),
      'Phone no. is not valid',
    ),
};

export const loginByPhoneAndPasswordSchema = z.object({
  ...baseAuthSchemaPhone,
  password: passwordValidation('Password'),
});

export const setPasswordSchema = z
  .object({
    userId: z
      .string({ required_error: 'userId is required' })
      .min(1)
      .refine((value) => validator.isMongoId(value), 'userId must be valid'),
    code: z
      .string({ required_error: 'code is required' })
      .min(4)
      .max(4)
      .refine((value) => validator.isAlphanumeric(value), 'code must be valid'),
    password: passwordValidation('Password'),
    confirmPassword: passwordValidation('Confirm password'),
  })
  .refine(
    (values) => values.confirmPassword === values.password,
    'Password and confirm password must be same',
  );

export const resetPasswordSchema = z.object({
  userId: z
    .string({ required_error: 'userId is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'userId must be valid'),
  code: z
    .string({ required_error: 'code is required' })
    .min(4)
    .max(4)
    .refine((value) => validator.isAlphanumeric(value), 'code must be valid'),
  password: passwordValidation('Password'),
  confirmPassword: passwordValidation('Confirm password'),
});

export const changePasswordSchema = z.object({
  currentPassword: passwordValidation('Current password'),
  newPassword: passwordValidation('New password'),
});

export const forgetPasswordSchema = z.object({
  ...baseAuthSchemaPhone,
});

export const verifyOtpSchema = z.object({
  otp: z.string({ required_error: 'OTP is required' }).min(4).max(4),
  userId: z
    .string()
    .min(1)
    .refine((value) => validator.isMongoId(value), 'Id must be valid'),

  type: z.enum(['RESET_PASSWORD', 'DEFAULT']).default('DEFAULT').optional(),
});

export const registerUserByEmailSchema = z
  .object({
    ...baseAuthSchemaEmail,
    ...baseAuthSchemaPhone,
    firstName: z.string({ required_error: 'Firstname is required' }).min(1),
    lastName: z.string({ required_error: 'Lastname is required' }).min(1),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
    dob: z
      .string({ required_error: 'Birthday is required' })
      .date("Date must be formated as 'YYYY-MM-DD'"),
  })
  .strict()
  .refine(({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      return false;
    }

    return true;
  }, 'Password and confirm password must be same');

export const loginUserByEmailSchema = z.object({
  ...baseAuthSchemaEmail,
});

export const loginUserByPhoneSchema = z.object({
  ...baseAuthSchemaPhone,
});

export const validateLoginOtpSchema = z.object({
  userId: z
    .string({ required_error: 'userId is required' })
    .refine((value) => validator.isMongoId(value), 'Id must be valid'),
  code: z
    .string()
    .min(4)
    .max(4)
    .refine((value) => validator.isAlphanumeric(value), 'code must be valid'),
});

export type RegisterUserByEmailSchemaType = z.infer<
  typeof registerUserByEmailSchema
>;

export type LoginUserByEmailSchemaType = z.infer<typeof loginUserByEmailSchema>;
export type LoginUserByPhoneSchemaType = z.infer<typeof loginUserByPhoneSchema>;
export type LoginUserByPhoneAndPasswordSchemaType = z.infer<
  typeof loginByPhoneAndPasswordSchema
>;

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
export type ForgetPasswordSchemaType = z.infer<typeof forgetPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
export type SetPasswordSchemaType = z.infer<typeof setPasswordSchema>;
export type VerifyOtpSchemaType = z.infer<typeof verifyOtpSchema>;
export type ValidateLoginOtpSchemaType = z.infer<typeof validateLoginOtpSchema>;
