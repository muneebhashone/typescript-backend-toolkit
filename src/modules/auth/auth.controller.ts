import type { Request, Response } from 'express';
import config from '../../config/config.service';
import { successResponse } from '../../utils/api.utils';
import type { JwtPayload } from '../../utils/auth.utils';
import { AUTH_COOKIE_KEY, COOKIE_CONFIG } from './auth.constants';
import type {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  GoogleTokenVerificationSchemaType,
  LoginUserByEmailSchemaType,
  RegisterUserByEmailSchemaType,
  ResetPasswordSchemaType,
} from './auth.schema';
import {
  changePassword,
  forgetPassword,
  loginUserByEmail,
  registerUserByEmail,
  resetPassword,
  verifyGoogleToken,
} from './auth.service';

export const handleResetPassword = async (
  req: Request<unknown, unknown, ResetPasswordSchemaType>,
  res: Response,
) => {
  await resetPassword(req.body);

  return successResponse(res, 'Password successfully reset');
};

export const handleForgetPassword = async (
  req: Request<unknown, unknown, ForgetPasswordSchemaType>,
  res: Response,
) => {
  const user = await forgetPassword(req.body);

  return successResponse(res, 'Code has been sent', { userId: user._id });
};

export const handleChangePassword = async (
  req: Request<unknown, unknown, ChangePasswordSchemaType>,
  res: Response,
) => {
  await changePassword((req.user as JwtPayload).sub, req.body);

  return successResponse(res, 'Password successfully changed');
};

export const handleRegisterUser = async (
  req: Request<unknown, unknown, RegisterUserByEmailSchemaType>,
  res: Response,
) => {
  const user = await registerUserByEmail(req.body);

  if (config.OTP_VERIFICATION_ENABLED) {
    return successResponse(res, 'Please check your email for OTP', user);
  }

  return successResponse(res, 'User has been reigstered', user);
};

export const handleLogout = async (_: Request, res: Response) => {
  res.cookie(AUTH_COOKIE_KEY, undefined, COOKIE_CONFIG);

  return successResponse(res, 'Logout successful');
};

export const handleLoginByEmail = async (
  req: Request<unknown, unknown, LoginUserByEmailSchemaType>,
  res: Response,
) => {
  const token = await loginUserByEmail(req.body);
  if (config.SET_SESSION) {
    res.cookie(AUTH_COOKIE_KEY, token, COOKIE_CONFIG);
  }
  return successResponse(res, 'Login successful', { token: token });
};

export const handleGetCurrentUser = async (req: Request, res: Response) => {
  const user = req.user;

  return successResponse(res, undefined, user);
};

export const handleGoogleTokenVerification = async (
  req: Request<unknown, unknown, GoogleTokenVerificationSchemaType>,
  res: Response,
) => {
  const { user, token } = await verifyGoogleToken(req.body);

  if (config.SET_SESSION) {
    res.cookie(AUTH_COOKIE_KEY, token, COOKIE_CONFIG);
  }

  return successResponse(res, 'Google authentication successful', {
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
    },
    token,
  });
};
