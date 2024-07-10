import { and, eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { RoleType } from '../drizzle/enums';
import { users } from '../drizzle/schema';
import {
  InvalidCredentialseError,
  NotFoundError,
} from '../errors/errors.service';
import { SendOtpEmailQueue } from '../queues/email.queue';
import { UserType } from '../types';
import { createUser } from '../user/user.services';
import {
  JwtPayload,
  compareHash,
  hashPassword,
  signToken,
} from '../utils/auth.utils';
import { generateRandomNumbers } from '../utils/common.utils';
import {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  LoginUserByEmailSchemaType,
  LoginUserByPhoneAndPasswordSchemaType,
  LoginUserByPhoneSchemaType,
  RegisterHostByPhoneSchemaType,
  RegisterUserByEmailSchemaType,
  ResetPasswordSchemaType,
  SetPasswordSchemaType,
  ValidateLoginOtpSchemaType,
  VerifyOtpSchemaType,
} from './auth.schema';

export const checkEmailExist = async () => {};

export const setPassword = async (payload: SetPasswordSchemaType) => {
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.setPasswordCode, payload.code),
      eq(users.id, payload.userId),
    ),
  });

  if (!user) {
    throw new Error('token is not valid or expired, please try again');
  }

  if (payload.confirmPassword !== payload.password) {
    throw new Error('Password and confirm password must be same');
  }

  const hashedPassword = await hashPassword(payload.password);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, payload.userId))
    .execute();
};

export const resetPassword = async (payload: ResetPasswordSchemaType) => {
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.passwordResetCode, payload.code),
      eq(users.id, payload.userId),
    ),
  });

  if (!user) {
    throw new Error('token is not valid or expired, please try again');
  }

  if (payload.confirmPassword !== payload.password) {
    throw new Error('Password and confirm password must be same');
  }

  const hashedPassword = await hashPassword(payload.password);

  await db
    .update(users)
    .set({ password: hashedPassword, passwordResetCode: null })
    .where(eq(users.id, payload.userId))
    .execute();
};

export const prepareSetPasswordAndSendEmail = async (
  user: UserType,
): Promise<void> => {
  const code = generateRandomNumbers(4);

  await db
    .update(users)
    .set({ setPasswordCode: code })
    .where(eq(users.id, user.id))
    .execute();
};

export const forgetPassword = async (
  payload: ForgetPasswordSchemaType,
): Promise<UserType> => {
  const user = await db.query.users.findFirst({
    where: eq(users.phoneNo, payload.phoneNo),
  });

  if (!user) {
    throw new Error("user doesn't exists");
  }

  const code = generateRandomNumbers(4);

  await db
    .update(users)
    .set({ passwordResetCode: code })
    .where(eq(users.id, user.id))
    .execute();

  return user;
};

export const verifyOtp = async (
  payload: VerifyOtpSchemaType,
): Promise<UserType> => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  });

  if (!user) {
    throw new Error("User isn't registered");
  }

  if (payload.type) {
    if (payload.type === 'RESET_PASSWORD') {
      if (user.passwordResetCode !== payload.otp) {
        throw new Error('Invalid password reset code');
      }
    }

    if (payload.type === 'DEFAULT') {
      if (user.otp !== payload.otp) {
        throw new Error('Invalid OTP');
      }

      await db.update(users).set({ otp: null }).where(eq(users.id, user.id));
    }
  } else {
    if (user.otp !== payload.otp) {
      throw new Error('Invalid OTP');
    }

    await db.update(users).set({ otp: null }).where(eq(users.id, user.id));
  }

  return user;
};

export const changePassword = async (
  userId: number,
  payload: ChangePasswordSchemaType,
): Promise<void> => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user || !user.password) {
    throw new NotFoundError('User is not found');
  }

  const isCurrentPassowordCorrect = await compareHash(
    user.password,
    payload.currentPassword,
  );

  if (!isCurrentPassowordCorrect) {
    throw new Error('current password is not valid');
  }

  const hashedPassword = await hashPassword(payload.newPassword);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId))
    .execute();
};

export const registerUserByEmail = async (
  payload: RegisterUserByEmailSchemaType,
): Promise<{ user: UserType; otpSendTo: string[] }> => {
  const userExistByEmail = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (userExistByEmail && userExistByEmail.otp === null) {
    throw new Error('Account already exist with same email address');
  }

  const userExistByPhone = await db.query.users.findFirst({
    where: eq(users.phoneNo, payload.phoneNo),
  });

  if (userExistByPhone && userExistByPhone.otp === null) {
    throw new Error('Account already exist with same phone no.');
  }

  const otp = generateRandomNumbers(4);

  const otpSendTo = [];

  // It means user is registered already but didn't perform otp verification
  if (userExistByEmail) {
    await db.delete(users).where(eq(users.id, userExistByEmail.id)).execute();
  }

  if (userExistByPhone) {
    await db.delete(users).where(eq(users.id, userExistByPhone.id)).execute();
  }

  const user = await createUser(
    {
      email: payload.email,
      firstName: payload.email,
      lastName: payload.lastName,
      password: payload.password,
      dob: payload.dob,
      phoneNo: payload.phoneNo,
      role: 'DEFAULT_USER',
      isActive: true,
      otp: otp,
    },
    false,
  );

  await SendOtpEmailQueue.add(String(otp), {
    email: payload.email,
    otpCode: otp,
    userName: `${payload.firstName} ${payload.lastName}`,
  });

  otpSendTo.push('email');

  if (user.phoneNo) {
    otpSendTo.push('phone');
  }

  return { user, otpSendTo };
};

export const registerHostByPhone = async (
  payload: RegisterHostByPhoneSchemaType,
): Promise<{ user: UserType; otpSendTo: string[] }> => {
  const userExist = await db.query.users.findFirst({
    where: eq(users.phoneNo, payload.phoneNo),
  });

  // User exist and have perform otp verification
  if (userExist && userExist.otp === null) {
    throw new Error('Account already exist');
  }

  const otp = generateRandomNumbers(4);

  const otpSendTo = [];

  // It means user is registered already but didn't perform otp verification
  if (userExist) {
    await db.delete(users).where(eq(users.id, userExist.id));
  }

  const user = await createUser(
    {
      password: payload.password,
      phoneNo: payload.phoneNo,
      role: 'VENDOR',
      isActive: true,
      otp: otp,
    },
    false,
  );

  if (user.phoneNo) {
    otpSendTo.push('phone');
  }

  return { user, otpSendTo };
};

export const canUserAuthorize = (user: UserType) => {
  if (!user.isActive) {
    throw new Error('Your account is disabled');
  }

  if (user.otp !== null) {
    throw new Error('Your account is not verified');
  }
};

export const loginUserByEmail = async (
  payload: LoginUserByEmailSchemaType,
): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (!user || !(await compareHash(String(user.password), payload.password))) {
    throw new InvalidCredentialseError('Invalid email or password');
  }

  await canUserAuthorize(user);

  const jwtPayload: JwtPayload = {
    sub: String(user.id),
    email: user?.email,
    phoneNo: user?.phoneNo,
    role: String(user.role) as RoleType,
  };

  const token = await signToken(jwtPayload);

  return token;
};

export const loginUserByPhoneAndPassword = async (
  payload: LoginUserByPhoneAndPasswordSchemaType,
): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: eq(users.phoneNo, payload.phoneNo),
  });

  if (!user || !(await compareHash(String(user.password), payload.password))) {
    throw new InvalidCredentialseError('Invalid phone no. or password');
  }

  await canUserAuthorize(user);

  const jwtPayload: JwtPayload = {
    sub: String(user.id),
    email: user?.email,
    phoneNo: user?.phoneNo,
    role: String(user.role) as RoleType,
  };

  const token = await signToken(jwtPayload);

  return token;
};

export const loginUserByPhone = async (
  payload: LoginUserByPhoneSchemaType,
): Promise<UserType> => {
  const user = await db.query.users.findFirst({
    where: eq(users.phoneNo, payload.phoneNo),
  });

  if (!user) {
    throw new Error('User not found');
  }

  await canUserAuthorize(user);

  const loginOtp = generateRandomNumbers(4);

  await db
    .update(users)
    .set({ loginOtp: loginOtp })
    .where(eq(users.id, user.id))
    .execute();

  return user;
};

export const validateLoginOtp = async (payload: ValidateLoginOtpSchemaType) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  if ('loginOtp' in user && user.loginOtp !== payload.code) {
    throw new Error('Code is invalid');
  }

  await canUserAuthorize(user);

  await db
    .update(users)
    .set({ loginOtp: null })
    .where(eq(users.id, user.id))
    .execute();

  const jwtPayload: JwtPayload = {
    sub: String(user.id),
    email: user?.email,
    phoneNo: user?.phoneNo,
    role: String(user.role) as RoleType,
  };

  const token = await signToken(jwtPayload);

  return token;
};
