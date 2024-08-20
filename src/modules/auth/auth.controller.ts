import { Request, Response } from 'express';
import config from '../../config/config.service';
import { GoogleCallbackQuery } from '../../types';
import { successResponse } from '../../utils/api.utils';
import { JwtPayload } from '../../utils/auth.utils';
import { AUTH_COOKIE_KEY, COOKIE_CONFIG } from './auth.constants';
import {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  LoginUserByEmailSchemaType,
  RegisterUserByEmailSchemaType,
  ResetPasswordSchemaType,
} from './auth.schema';
import {
  changePassword,
  forgetPassword,
  googleLogin,
  loginUserByEmail,
  registerUserByEmail,
  resetPassword,
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
export const handleGoogleLogin = async (_: Request, res: Response) => {
  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=email profile`;
  res.redirect(googleAuthURL);
};
export const handleGoogleCallback = async (
  req: Request<unknown, unknown, unknown, GoogleCallbackQuery>,
  res: Response,
) => {
  const user = await googleLogin(req.query);
  if (!user) throw new Error('Failed to login');
  res.cookie(
    AUTH_COOKIE_KEY,
    user.socialAccount?.[0]?.accessToken,
    COOKIE_CONFIG,
  );

  return successResponse(res, 'Logged in successfully', {
    token: user.socialAccount?.[0]?.accessToken,
  });
};
