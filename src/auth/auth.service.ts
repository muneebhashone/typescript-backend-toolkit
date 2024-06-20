import { InferInsertModel, InferSelectModel, eq } from 'drizzle-orm';
import { createCompany } from '../company/company.service';
import { db } from '../drizzle/db';
import { RoleType } from '../drizzle/enums';
import { companies, users } from '../drizzle/schema';
import {
  ConflictError,
  InvalidCredentialseError,
  NotFoundError,
} from '../errors/errors.service';
import {
  ResetPasswordQueue,
  SetPasswordEmailQueue,
} from '../queues/email.queue';
import { createUser } from '../user/user.services';
import {
  generateResetPasswordLink,
  generateSetPasswordLink,
} from '../utils/api.utils';
import {
  JwtPayload,
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
  LoginUserSchemaType,
  RegisterCompanySchemaType,
  ResetPasswordSchemaType,
  SetPasswordSchemaType,
} from './auth.schema';
import { UserType } from '../types';
import { PasswordResetTokenPayload } from '../utils/auth.utils';

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
    name: String(user.name),
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
    userName: user.name,
    resetLink: generateResetPasswordLink(token),
  });
};

export const changePassword = async (
  userId: number,
  payload: ChangePasswordSchemaType,
): Promise<void> => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) {
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

export const registerUser = async (
  payload: InferInsertModel<typeof users> & { password: string },
): Promise<InferSelectModel<typeof users>> => {
  return createUser(payload);
};

export type RegisterCompanyReturnType = {
  company: InferSelectModel<typeof companies>;
  user: InferSelectModel<typeof users>;
};

export const registerCompany = async (
  payload: RegisterCompanySchemaType,
): Promise<RegisterCompanyReturnType> => {
  const isCompanyExist = await db.query.companies.findFirst({
    where: eq(companies.name, payload.companyName.toLowerCase()),
  });

  if (isCompanyExist) {
    throw new ConflictError('Company already exist with a same name');
  }

  const isUserExist = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (isUserExist) {
    throw new ConflictError('User already exists with a same email address');
  }

  const company = await createCompany(
    {
      companyName: payload.companyName,
      city: payload.city,
      country: payload.country,
    },
    'REQUESTED',
    false,
  );

  const user = await createUser(
    {
      companyId: company.id,
      email: payload.email,
      name: payload.name,
      password: payload.password,
      role: 'WHITE_LABEL_ADMIN',
      permissions: [
        'VIEW_SHIPMENT',
        'VIEW_USER',
        'VIEW_DASHBOARD',
        'CREATE_USER',
        'CREATE_SHIPMENT',
        'DELETE_SHIPMENT',
        'DELETE_USER',
        'EDIT_SHIPMENT',
        'EDIT_USER',
      ],
      status: 'REQUESTED',
    },
    false,
  );

  return { user, company };
};

export const loginUser = async (
  payload: LoginUserSchemaType,
): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (!user || !(await compareHash(String(user.password), payload.password))) {
    throw new InvalidCredentialseError('Invalid email or password');
  }

  if (user.status === 'REQUESTED') {
    throw new Error('Your account is pending approval from admin');
  }

  if (user.status === 'REJECTED') {
    throw new Error('Your account has been rejected');
  }

  if (!user.isActive) {
    throw new Error('Your account is disabled');
  }

  const jwtPayload: JwtPayload = {
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: String(user.role) as RoleType,
  };

  const token = await signToken(jwtPayload);

  return token;
};
