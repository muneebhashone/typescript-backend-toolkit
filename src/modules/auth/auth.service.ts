import config from '../../config/config.service';
import { ROLE_ENUM, type RoleType, SOCIAL_ACCOUNT_ENUM } from '../../enums';
import {
  type JwtPayload,
  compareHash,
  generateOTP,
  hashPassword,
  signToken,
  verifyGoogleIdToken,
} from '../../utils/auth.utils';
import { generateRandomNumbers } from '../../utils/common.utils';
import type { UserType } from '../user/user.dto';
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from '../user/user.services';
import type {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  GoogleTokenVerificationSchemaType,
  LoginUserByEmailSchemaType,
  RegisterUserByEmailSchemaType,
  ResetPasswordSchemaType,
} from './auth.schema';

export const resetPassword = async (payload: ResetPasswordSchemaType) => {
  const user = await getUserById(payload.userId);

  if (!user || user.passwordResetCode !== payload.code) {
    throw new Error('token is not valid or expired, please try again');
  }

  if (payload.confirmPassword !== payload.password) {
    throw new Error('Password and confirm password must be same');
  }

  const hashedPassword = await hashPassword(payload.password);

  await updateUser(payload.userId, {
    password: hashedPassword,
    passwordResetCode: null,
  });
};

export const forgetPassword = async (
  payload: ForgetPasswordSchemaType,
): Promise<UserType> => {
  const user = await getUserByEmail(payload.email);

  if (!user) {
    throw new Error("user doesn't exists");
  }

  const code = generateRandomNumbers(4);

  await updateUser(user._id, { passwordResetCode: code });

  return user;
};

export const changePassword = async (
  userId: string,
  payload: ChangePasswordSchemaType,
): Promise<void> => {
  const user = await getUserById(userId, '+password');

  if (!user || !user.password) {
    throw new Error('User is not found');
  }

  const isCurrentPassowordCorrect = await compareHash(
    user.password,
    payload.currentPassword,
  );

  if (!isCurrentPassowordCorrect) {
    throw new Error('current password is not valid');
  }

  const hashedPassword = await hashPassword(payload.newPassword);

  await updateUser(userId, { password: hashedPassword });
};

export const registerUserByEmail = async (
  payload: RegisterUserByEmailSchemaType,
): Promise<UserType> => {
  const userExistByEmail = await getUserByEmail(payload.email);

  if (userExistByEmail) {
    throw new Error('Account already exist with same email address');
  }

  const { confirmPassword, ...rest } = payload;

  const otp = config.OTP_VERIFICATION_ENABLED ? generateOTP() : null;

  const user = await createUser({ ...rest, role: 'DEFAULT_USER', otp }, false);

  return user;
};

export const loginUserByEmail = async (
  payload: LoginUserByEmailSchemaType,
): Promise<string> => {
  const user = await getUserByEmail(payload.email, '+password');

  if (!user || !(await compareHash(String(user.password), payload.password))) {
    throw new Error('Invalid email or password');
  }

  const jwtPayload: JwtPayload = {
    sub: String(user._id),
    email: user?.email,
    phoneNo: user?.phoneNo,
    role: String(user.role) as RoleType,
    username: user.username,
  };

  const token = await signToken(jwtPayload);

  return token;
};

export const verifyGoogleToken = async (
  payload: GoogleTokenVerificationSchemaType,
): Promise<{ user: UserType; token: string }> => {
  const tokenPayload = await verifyGoogleIdToken(payload.idToken);

  const { googleId, email, name, picture, emailVerified, tokenExpiry } =
    tokenPayload;

  if (!emailVerified) {
    throw new Error('Google account email is not verified');
  }

  const existingUser = await getUserByEmail(email);

  let user: UserType;

  if (!existingUser) {
    user = await createUser({
      email,
      username: name || email.split('@')[0],
      avatar: picture,
      role: ROLE_ENUM.DEFAULT_USER,
      password: generateRandomNumbers(8),
      socialAccount: [
        {
          refreshToken: '',
          tokenExpiry: new Date(tokenExpiry * 1000),
          accountType: SOCIAL_ACCOUNT_ENUM.GOOGLE,
          accessToken: payload.idToken,
          accountID: googleId,
        },
      ],
    });
  } else {
    user = await updateUser(existingUser._id, {
      ...(picture && { avatar: picture }),
      socialAccount: [
        {
          refreshToken: '',
          tokenExpiry: new Date(tokenExpiry * 1000),
          accountType: SOCIAL_ACCOUNT_ENUM.GOOGLE,
          accessToken: payload.idToken,
          accountID: googleId,
        },
      ],
    });
  }

  const jwtPayload: JwtPayload = {
    sub: String(user._id),
    email: user.email,
    phoneNo: user.phoneNo,
    role: String(user.role) as RoleType,
    username: user.username,
  };

  const token = await signToken(jwtPayload);

  return { user, token };
};
