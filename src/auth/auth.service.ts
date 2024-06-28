import { InferInsertModel, InferSelectModel, eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { RoleType } from '../drizzle/enums';
import { users } from '../drizzle/schema';
import {
  InvalidCredentialseError,
  NotFoundError,
} from '../errors/errors.service';
import {
  ResetPasswordQueue,
  SendOtpEmailQueue,
  SetPasswordEmailQueue,
} from '../queues/email.queue';
import { UserType } from '../types';
import { createUser, updateUser } from '../user/user.services';
import {
  generateResetPasswordLink,
  generateSetPasswordLink,
} from '../utils/api.utils';
import {
  JwtPayload,
  PasswordResetTokenPayload,
  SetPasswordTokenPayload,
  compareHash,
  hashPassword,
  signPasswordResetToken,
  signSetPasswordToken,
  signToken,
  verifyToken,
} from '../utils/auth.utils';
import {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  LoginUserByEmailSchemaType,
  RegisterHostByPhoneSchemaType,
  RegisterUserByEmailSchemaType,
  ResetPasswordSchemaType,
  SetPasswordSchemaType,
  VerifyOtpSchemaType,
} from './auth.schema';
import { generateRandomNumbers } from '../utils/common.utils';

export const setPassword = async (payload: SetPasswordSchemaType) => {
  const user = await db.query.users.findFirst({
    where: eq(users.setPasswordToken, payload.token),
  });

  if (!user) {
    throw new Error('token is not valid or expired, please try again');
  }

  const tokenPayload = await verifyToken<SetPasswordTokenPayload>(
    payload.token,
  );

  if (payload.confirmPassword !== payload.password) {
    throw new Error('Password and confirm password must be same');
  }

  const hashedPassword = await hashPassword(payload.password);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, Number(tokenPayload.userId)))
    .execute();
};

export const resetPassword = async (payload: ResetPasswordSchemaType) => {
  const user = await db.query.users.findFirst({
    where: eq(users.passwordResetToken, payload.token),
  });

  if (!user) {
    throw new Error('token is not valid or expired, please try again');
  }

  const tokenPayload = await verifyToken<PasswordResetTokenPayload>(
    payload.token,
  );

  if (payload.confirmPassword !== payload.password) {
    throw new Error('Password and confirm password must be same');
  }

  const hashedPassword = await hashPassword(payload.password);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, Number(tokenPayload.userId)))
    .execute();
};

export const prepareSetPasswordAndSendEmail = async (
  user: UserType,
): Promise<void> => {
  if (!user.email) {
    throw new Error('Email is missing in the fields');
  }

  const token = await signSetPasswordToken({
    email: user.email,
    userId: String(user.id),
  });

  await db
    .update(users)
    .set({ setPasswordToken: token })
    .where(eq(users.id, user.id))
    .execute();

  await SetPasswordEmailQueue.add(String(user.id), {
    email: String(user.email),
    name: String(user.firstName),
    passwordSetLink: generateSetPasswordLink(token),
  });
};

export const forgetPassword = async (
  payload: ForgetPasswordSchemaType,
): Promise<void> => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (!user) {
    throw new Error("user doesn't exists");
  }

  if (!user.email) {
    throw new Error('Email is missing in the fields');
  }

  if (!user.firstName) {
    throw new Error('Firstname is missing in the fields');
  }

  const token = await signPasswordResetToken({
    email: user.email,
    userId: String(user.id),
  });

  await db
    .update(users)
    .set({ passwordResetToken: token })
    .where(eq(users.id, user.id))
    .execute();

  await ResetPasswordQueue.add(String(user.id), {
    email: user.email,
    userName: user.firstName,
    resetLink: generateResetPasswordLink(token),
  });
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

  if (user.otp !== payload.otp) {
    throw new Error('Invalid OTP');
  }

  await db.update(users).set({ otp: null }).where(eq(users.id, user.id));

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
  const userExist = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
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

export const loginUser = async (
  payload: LoginUserByEmailSchemaType,
): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (!user || !(await compareHash(String(user.password), payload.password))) {
    throw new InvalidCredentialseError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Your account is disabled');
  }

  if (user.otp !== null) {
    throw new Error('Your account is not verified');
  }

  const jwtPayload: JwtPayload = {
    sub: String(user.id),
    email: user?.email,
    phoneNo: user?.phoneNo,
    role: String(user.role) as RoleType,
  };

  const token = await signToken(jwtPayload);

  return token;
};
