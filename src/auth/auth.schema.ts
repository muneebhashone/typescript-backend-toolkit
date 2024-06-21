import z from 'zod';

const baseAuthSchema = {
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email is not valid' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must contain atleast 8 characters')
    .max(64, 'Password should not contain more than 64 characters')
    .refine((password) => {
      const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
      const containsLowercase = (ch: string) => /[a-z]/.test(ch);
      const containsSpecialChar = (ch: string) =>
        /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
      let countOfUpperCase = 0,
        countOfLowerCase = 0,
        countOfNumbers = 0,
        countOfSpecialChar = 0;
      for (let i = 0; i < password.length; i++) {
        let ch = password.charAt(i);
        if (!isNaN(Number(ch))) countOfNumbers++;
        else if (containsUppercase(ch)) countOfUpperCase++;
        else if (containsLowercase(ch)) countOfLowerCase++;
        else if (containsSpecialChar(ch)) countOfSpecialChar++;
      }

      if (
        countOfLowerCase < 1 ||
        countOfUpperCase < 1 ||
        countOfSpecialChar < 1 ||
        countOfNumbers < 1
      ) {
        return false;
      }

      return true;
    }, 'Password must be strong, should contain 1 lowercase letter, 1 uppercase letter, 1 special character, 1 number atleast'),
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

export const registerUserSchema = z
  .object({
    ...baseAuthSchema,
    firstName: z.string({ required_error: 'Name is required' }).min(1),
    lastName: z.string({ required_error: 'Name is required' }).min(1),
    phoneNo: z.string({ required_error: 'Phone number is required' }),
    phoneCountry: z.string({ required_error: 'Phone Country is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
    dob: z
      .string({ required_error: 'Birthday is required' })
      .date("Date must be formated as 'YYYY-MM-DD'"),
  })
  .refine(({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      return false;
    }

    return true;
  }, 'Password and confirm password must be same');

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
