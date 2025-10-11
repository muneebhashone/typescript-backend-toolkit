import config from '../../config/env';
import { ROLE_ENUM, type RoleType, SOCIAL_ACCOUNT_ENUM } from '../../enums';
import type { GoogleCallbackQuery } from '../../types';
import {
  type JwtPayload,
  compareHash,
  fetchGoogleTokens,
  generateOTP,
  getUserInfo,
  hashPassword,
  signToken,
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
  LoginUserByEmailSchemaType,
  RegisterUserByEmailSchemaType,
  ResetPasswordSchemaType,
} from './auth.schema';
import { getSessionManager } from './session/session.manager';

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

  if (config.SET_SESSION) {
    const sessionManager = getSessionManager();
    await sessionManager.revokeAllUserSessions(payload.userId);
  }
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

  if (config.SET_SESSION) {
    const sessionManager = getSessionManager();
    await sessionManager.revokeAllUserSessions(userId);
  }
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
  metadata?: { userAgent?: string; ipAddress?: string },
): Promise<{ token: string; sessionId?: string }> => {
  const user = await getUserByEmail(payload.email, '+password');

  if (!user || !(await compareHash(String(user.password), payload.password))) {
    throw new Error('Invalid email or password');
  }

  if (config.OTP_VERIFICATION_ENABLED && user.otp !== null) {
    throw new Error('Your account is not verified');
  }

  const jwtPayload: JwtPayload = {
    sub: String(user._id),
    email: user?.email,
    phoneNo: user?.phoneNo,
    role: String(user.role) as RoleType,
    username: user.username,
  };

  let sessionId: string | undefined;

  if (config.SET_SESSION) {
    const sessionManager = getSessionManager();

    // Lazy cleanup: remove user's expired/revoked sessions
    sessionManager.cleanupUserSessions(String(user._id)).then();

    // Step 1: Create session without token (store empty token temporarily)
    const session = await sessionManager.createSession({
      userId: String(user._id),
      token: '', // Placeholder empty token
      metadata,
    });

    sessionId = session.sessionId;

    // Step 2: Generate token once with real session ID
    jwtPayload.sid = sessionId;
    const token = await signToken(jwtPayload);

    // Step 3: Update session with actual token hash
    await sessionManager.updateSessionToken(sessionId, token);

    return { token, sessionId };
  }

  const token = await signToken(jwtPayload);
  return { token };
};

export const googleLogin = async (
  payload: GoogleCallbackQuery,
  metadata?: { userAgent?: string; ipAddress?: string },
): Promise<{ user: UserType; token: string; sessionId?: string }> => {
  const { code, error } = payload;

  if (error) {
    throw new Error(error);
  }

  if (!code) {
    throw new Error('Code Not Provided');
  }
  const tokenResponse = await fetchGoogleTokens({ code });

  const { access_token, refresh_token, expires_in } = tokenResponse;

  const userInfoResponse = await getUserInfo(access_token);

  const { id, email, name, picture } = userInfoResponse;

  let user = await getUserByEmail(email);

  if (!user) {
    user = await createUser({
      email,
      username: name,
      avatar: picture,
      role: ROLE_ENUM.DEFAULT_USER,
      password: generateRandomNumbers(4),
      socialAccount: [
        {
          refreshToken: refresh_token,
          tokenExpiry: new Date(Date.now() + expires_in * 1000),
          accountType: SOCIAL_ACCOUNT_ENUM.GOOGLE,
          accessToken: access_token,
          accountID: id,
        },
      ],
    });
  } else {
    user = await updateUser(user._id, {
      socialAccount: [
        {
          refreshToken: refresh_token,
          tokenExpiry: new Date(Date.now() + expires_in * 1000),
          accountType: SOCIAL_ACCOUNT_ENUM.GOOGLE,
          accessToken: access_token,
          accountID: id,
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

  let sessionId: string | undefined;

  if (config.SET_SESSION) {
    const sessionManager = getSessionManager();

    // Lazy cleanup: remove user's expired/revoked sessions
    sessionManager.cleanupUserSessions(String(user._id)).then();

    // Step 1: Create session without token (store empty token temporarily)
    const session = await sessionManager.createSession({
      userId: String(user._id),
      token: '', // Placeholder empty token
      metadata,
    });

    sessionId = session.sessionId;

    // Step 2: Generate token once with real session ID
    jwtPayload.sid = sessionId;
    const token = await signToken(jwtPayload);

    // Step 3: Update session with actual token hash
    await sessionManager.updateSessionToken(sessionId, token);

    return { user, token, sessionId };
  }

  const token = await signToken(jwtPayload);
  return { user, token };
};
