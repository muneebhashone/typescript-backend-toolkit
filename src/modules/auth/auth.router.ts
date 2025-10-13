import { z } from 'zod';
import { canAccess } from '../../middlewares/can-access';
import MagicRouter from '../../openapi/magic-router';
import { R } from '../../openapi/response.builders';
import { userOutSchema } from '../user/user.dto';
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
} from './auth.schema';
import { sessionRecordSchema } from './session/session.schema';

export const AUTH_ROUTER_ROOT = '/auth';

const authRouter = new MagicRouter(AUTH_ROUTER_ROOT);

// Login with email
authRouter.post(
  '/login/email',
  {
    requestType: { body: loginUserByEmailSchema },
    responses: {
      200: R.success(z.object({ token: z.string() })),
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
      201: R.success(z.object({ token: z.string() })),
    },
  },
  handleRegisterUser,
);

// Logout
authRouter.post(
  '/logout',
  {
    responses: {
      200: R.success(
        z.object({
          success: z.boolean(),
          message: z.string(),
        }),
      ),
    },
  },
  handleLogout,
);

// Get current user
authRouter.get(
  '/me',
  {
    responses: {
      200: R.success(userOutSchema),
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
      200: R.success(z.object({ userId: z.string() })),
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
      200: R.success(
        z.object({
          success: z.boolean(),
          message: z.string(),
        }),
      ),
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
      200: R.success(
        z.object({
          success: z.boolean(),
          message: z.string(),
        }),
      ),
    },
  },
  handleResetPassword,
);

// Google OAuth (redirects, no response schemas needed)
authRouter.get('/google', {}, handleGoogleLogin);
authRouter.get('/google/callback', {}, handleGoogleCallback);

// Session management
authRouter.get(
  '/sessions',
  {
    responses: {
      200: R.success(z.array(sessionRecordSchema)),
    },
  },
  canAccess(),
  handleListSessions,
);

authRouter.delete(
  '/sessions/:sessionId',
  {
    responses: {
      200: R.success(
        z.object({
          success: z.boolean(),
          message: z.string(),
        }),
      ),
    },
  },
  canAccess(),
  handleRevokeSession,
);

authRouter.delete(
  '/sessions',
  {
    responses: {
      200: R.success(
        z.object({
          success: z.boolean(),
          message: z.string(),
        }),
      ),
    },
  },
  canAccess(),
  handleRevokeAllSessions,
);

export default authRouter.getRouter();
