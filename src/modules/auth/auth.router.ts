import { canAccess } from '@/middlewares/can-access';
import MagicRouter from '@/plugins/magic/router';
import {
  handleChangePassword,
  handleForgetPassword,
  handleGetCurrentUser,
  handleGoogleCallback,
  handleGoogleLogin,
  handleListSessions,
  handleLoginByEmail,
  handleLogout,
  handleRegisterUser,
  handleResetPassword,
  handleRevokeAllSessions,
  handleRevokeSession,
} from './auth.controller';
import {
  changePasswordSchema,
  forgetPasswordSchema,
  loginUserByEmailSchema,
  registerUserByEmailSchema,
  resetPasswordSchema,
  loginResponseSchema,
  registerResponseSchema,
  logoutResponseSchema,
  getCurrentUserResponseSchema,
  forgetPasswordResponseSchema,
  changePasswordResponseSchema,
  resetPasswordResponseSchema,
  listSessionsResponseSchema,
  revokeSessionResponseSchema,
  revokeAllSessionsResponseSchema,
  googleLoginResponseSchema,
  googleCallbackSchema,
  googleCallbackResponseSchema,
} from './auth.schema';

export const AUTH_ROUTER_ROOT = '/auth';

const authRouter = new MagicRouter(AUTH_ROUTER_ROOT);

// Login with email
authRouter.post(
  '/login/email',
  {
    requestType: { body: loginUserByEmailSchema },
    responses: {
      200: loginResponseSchema,
    },
  },
  handleLoginByEmail,
);

// Register with email
authRouter.post(
  '/register/email',
  {
    requestType: { body: registerUserByEmailSchema },
    responses: {
      201: registerResponseSchema,
    },
  },
  handleRegisterUser,
);

// Logout
authRouter.post(
  '/logout',
  {
    responses: {
      200: logoutResponseSchema,
    },
  },
  handleLogout,
);

// Get current user
authRouter.get(
  '/me',
  {
    responses: {
      200: getCurrentUserResponseSchema,
    },
  },
  canAccess(),
  handleGetCurrentUser,
);

// Forget password
authRouter.post(
  '/forget-password',
  {
    requestType: { body: forgetPasswordSchema },
    responses: {
      200: forgetPasswordResponseSchema,
    },
  },
  handleForgetPassword,
);

// Change password
authRouter.post(
  '/change-password',
  {
    requestType: { body: changePasswordSchema },
    responses: {
      200: changePasswordResponseSchema,
    },
  },
  canAccess(),
  handleChangePassword,
);

// Reset password
authRouter.post(
  '/reset-password',
  {
    requestType: { body: resetPasswordSchema },
    responses: {
      200: resetPasswordResponseSchema,
    },
  },
  handleResetPassword,
);

authRouter.get('/google', { responses: { 200: googleLoginResponseSchema } }, handleGoogleLogin);

authRouter.get('/google/callback', { requestType: { query: googleCallbackSchema }, responses: { 200: googleCallbackResponseSchema } }, handleGoogleCallback);

// Session management
authRouter.get(
  '/sessions',
  {
    responses: {
      200: listSessionsResponseSchema,
    },
  },
  canAccess(),
  handleListSessions,
);

authRouter.delete(
  '/sessions/:sessionId',
  {
    responses: {
      200: revokeSessionResponseSchema,
    },
  },
  canAccess(),
  handleRevokeSession,
);

authRouter.delete(
  '/sessions',
  {
    responses: {
      200: revokeAllSessionsResponseSchema,
    },
  },
  canAccess(),
  handleRevokeAllSessions,
);

export default authRouter.getRouter();
