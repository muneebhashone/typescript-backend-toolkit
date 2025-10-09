import type { Request, Response } from 'express';
import config from '../../config/env';
import type { GoogleCallbackQuery } from '../../types';
import { successResponse } from '../../utils/api.utils';
import type { JwtPayload } from '../../utils/auth.utils';
import { AUTH_COOKIE_KEY, COOKIE_CONFIG } from './auth.constants';
import type {
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

  if (config.OTP_VERIFICATION_ENABLED) {
    return successResponse(res, 'Please check your email for OTP', user);
  }

  return successResponse(res, 'User has been reigstered', user);
};

export const handleLogout = async (req: Request, res: Response) => {
  if (config.SET_SESSION && req.session && req.app.locals.sessionManager) {
    const sessionManager = req.app.locals.sessionManager;
    await sessionManager.revokeSession(req.session.sessionId);
  }

  res.cookie(AUTH_COOKIE_KEY, undefined, COOKIE_CONFIG);

  return successResponse(res, 'Logout successful');
};

export const handleLoginByEmail = async (
  req: Request<unknown, unknown, LoginUserByEmailSchemaType>,
  res: Response,
) => {
  const metadata = {
    userAgent: req.headers['user-agent'],
    ipAddress:
      req.ip ||
      (req.headers['x-forwarded-for'] as string) ||
      req.connection?.remoteAddress,
  };

  const result = await loginUserByEmail(req.body, metadata);

  if (config.SET_SESSION) {
    res.cookie(AUTH_COOKIE_KEY, result.token, COOKIE_CONFIG);
  }

  return successResponse(res, 'Login successful', {
    token: result.token,
    sessionId: result.sessionId,
  });
};

export const handleGetCurrentUser = async (req: Request, res: Response) => {
  const user = req.user;

  return successResponse(res, undefined, user);
};
export const handleGoogleLogin = async (_: Request, res: Response) => {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_REDIRECT_URI) {
    throw new Error('Google credentials are not set');
  }

  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${config.GOOGLE_REDIRECT_URI}&scope=email profile`;

  res.redirect(googleAuthURL);
};
export const handleGoogleCallback = async (
  req: Request<unknown, unknown, unknown, GoogleCallbackQuery>,
  res: Response,
) => {
  const metadata = {
    userAgent: req.headers['user-agent'],
    ipAddress:
      req.ip ||
      (req.headers['x-forwarded-for'] as string) ||
      req.connection?.remoteAddress,
  };

  const result = await googleLogin(req.query, metadata);

  if (!result.user) throw new Error('Failed to login');

  if (config.SET_SESSION) {
    res.cookie(AUTH_COOKIE_KEY, result.token, COOKIE_CONFIG);
  }

  return successResponse(res, 'Logged in successfully', {
    token: result.token,
    sessionId: result.sessionId,
  });
};

export const handleListSessions = async (req: Request, res: Response) => {
  if (!config.SET_SESSION || !req.app.locals.sessionManager) {
    throw new Error('Session management is not enabled');
  }

  const userId = (req.user as JwtPayload).sub;
  const sessionManager = req.app.locals.sessionManager;
  const sessions = await sessionManager.listUserSessions(userId);

  return successResponse(res, undefined, { sessions });
};

export const handleRevokeSession = async (
  req: Request<{ sessionId: string }>,
  res: Response,
) => {
  if (!config.SET_SESSION || !req.app.locals.sessionManager) {
    throw new Error('Session management is not enabled');
  }

  const sessionManager = req.app.locals.sessionManager;
  await sessionManager.revokeSession(req.params.sessionId);

  return successResponse(res, 'Session revoked successfully');
};

export const handleRevokeAllSessions = async (req: Request, res: Response) => {
  if (!config.SET_SESSION || !req.app.locals.sessionManager) {
    throw new Error('Session management is not enabled');
  }

  const userId = (req.user as JwtPayload).sub;
  const sessionManager = req.app.locals.sessionManager;
  await sessionManager.revokeAllUserSessions(userId);

  return successResponse(res, 'All sessions revoked successfully');
};
