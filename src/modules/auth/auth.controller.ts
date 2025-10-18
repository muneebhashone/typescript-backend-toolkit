import type { Request } from 'express';
import config from '../../config/env';
import type { GoogleCallbackQuery, ResponseExtended } from '../../types';
import { successResponse } from '../../utils/api.utils';
import type { JwtPayload } from '../../utils/auth.utils';
import { AUTH_COOKIE_KEY, COOKIE_CONFIG } from './auth.constants';
import type {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  LoginUserByEmailSchemaType,
  RegisterUserByEmailSchemaType,
  ResetPasswordSchemaType,
  ResetPasswordResponseSchema,
  ForgetPasswordResponseSchema,
  ChangePasswordResponseSchema,
  LogoutResponseSchema,
  LoginResponseSchema,
  GetCurrentUserResponseSchema,
  ListSessionsResponseSchema,
  RevokeSessionResponseSchema,
  RevokeAllSessionsResponseSchema,
} from './auth.schema';
import {
  changePassword,
  forgetPassword,
  googleLogin,
  loginUserByEmail,
  registerUserByEmail,
  resetPassword,
} from './auth.service';

// Using new res.ok() helper
export const handleResetPassword = async (
  req: Request<unknown, unknown, ResetPasswordSchemaType>,
  res: ResponseExtended<ResetPasswordResponseSchema>,
) => {
  await resetPassword(req.body);

  return res.ok?.({
    success: true,
    message: 'Password successfully reset',
  });
};

// Using new res.ok() helper
export const handleForgetPassword = async (
  req: Request<unknown, unknown, ForgetPasswordSchemaType>,
  res: ResponseExtended<ForgetPasswordResponseSchema>,
) => {
  const user = await forgetPassword(req.body);

  return res.ok?.({
    success: true,
    message: 'Code has been sent',
    data: { userId: user._id },
  });
};

// Using new res.ok() helper
export const handleChangePassword = async (
  req: Request<unknown, unknown, ChangePasswordSchemaType>,
  res: ResponseExtended<ChangePasswordResponseSchema>,
) => {
  await changePassword((req.user as JwtPayload).sub, req.body);

  return res.ok?.({
    success: true,
    message: 'Password successfully changed',
  });
};

// Using legacy successResponse (register doesn't return token directly)
export const handleRegisterUser = async (
  req: Request<unknown, unknown, RegisterUserByEmailSchemaType>,
  res: ResponseExtended,
) => {
  const user = await registerUserByEmail(req.body);

  if (config.OTP_VERIFICATION_ENABLED) {
    return successResponse(res, 'Please check your email for OTP', user);
  }

  return successResponse(res, 'User has been registered', user);
};

// Using new res.ok() helper
export const handleLogout = async (req: Request, res: ResponseExtended<LogoutResponseSchema>) => {
  if (config.SET_SESSION && req.session && req.app.locals.sessionManager) {
    const sessionManager = req.app.locals.sessionManager;
    await sessionManager.revokeSession(req.session.sessionId);
  }

  res.clearCookie(AUTH_COOKIE_KEY, COOKIE_CONFIG);

  return res.ok?.({
    success: true,
    message: 'Logout successful',
  });
};

// Using new res.ok() helper (login uses 200, not 201)
export const handleLoginByEmail = async (
  req: Request<unknown, unknown, LoginUserByEmailSchemaType>,
  res: ResponseExtended<LoginResponseSchema>,
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

  return res.ok?.({
    success: true,
    message: 'Login successful',
    data: {
      token: result.token,
    },
  });
};

// Using new res.ok() helper
export const handleGetCurrentUser = async (
  req: Request,
  res: ResponseExtended<GetCurrentUserResponseSchema>,
) => {
  const user = req.user;

  return res.ok?.({
    success: true,
    data: user,
  });
};
// Google OAuth redirects - no response schema needed
export const handleGoogleLogin = async (_: Request, res: ResponseExtended) => {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_REDIRECT_URI) {
    throw new Error('Google credentials are not set');
  }

  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${config.GOOGLE_REDIRECT_URI}&scope=email profile`;

  res.redirect(googleAuthURL);
};

export const handleGoogleCallback = async (
  req: Request<unknown, unknown, unknown, GoogleCallbackQuery>,
  res: ResponseExtended,
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

// Using new res.ok() helper
export const handleListSessions = async (
  req: Request,
  res: ResponseExtended<ListSessionsResponseSchema>,
) => {
  if (!config.SET_SESSION || !req.app.locals.sessionManager) {
    throw new Error('Session management is not enabled');
  }

  const userId = (req.user as JwtPayload).sub;
  const sessionManager = req.app.locals.sessionManager;
  const sessions = await sessionManager.listUserSessions(userId);

  return res.ok?.({
    success: true,
    data: sessions,
  });
};

// Using new res.ok() helper
export const handleRevokeSession = async (
  req: Request<{ sessionId: string }>,
  res: ResponseExtended<RevokeSessionResponseSchema>,
) => {
  if (!config.SET_SESSION || !req.app.locals.sessionManager) {
    throw new Error('Session management is not enabled');
  }

  const sessionManager = req.app.locals.sessionManager;
  await sessionManager.revokeSession(req.params.sessionId);

  return res.ok?.({
    success: true,
    message: 'Session revoked successfully',
  });
};

// Using new res.ok() helper
export const handleRevokeAllSessions = async (
  req: Request,
  res: ResponseExtended<RevokeAllSessionsResponseSchema>,
) => {
  if (!config.SET_SESSION || !req.app.locals.sessionManager) {
    throw new Error('Session management is not enabled');
  }

  const userId = (req.user as JwtPayload).sub;
  const sessionManager = req.app.locals.sessionManager;
  await sessionManager.revokeAllUserSessions(userId);

  return res.ok?.({
    success: true,
    message: 'All sessions revoked successfully',
  });
};
