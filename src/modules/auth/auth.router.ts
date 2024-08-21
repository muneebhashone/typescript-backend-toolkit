import { canAccess } from '../../middlewares/can-access.middleware';
import MagicRouter from '../../openapi/magic-router';
import {
  handleChangePassword,
  handleForgetPassword,
  handleGetCurrentUser,
  handleGoogleCallback,
  handleGoogleLogin,
  handleLoginByEmail,
  handleLogout,
  handleRegisterUser,
  handleResetPassword,
} from './auth.controller';
import {
  changePasswordSchema,
  forgetPasswordSchema,
  loginUserByEmailSchema,
  registerUserByEmailSchema,
  resetPasswordSchema,
} from './auth.schema';

export const AUTH_ROUTER_ROOT = '/auth';

const authRouter = new MagicRouter(AUTH_ROUTER_ROOT);

authRouter.post(
  '/register/user',
  { requestType: { body: registerUserByEmailSchema } },
  handleRegisterUser,
);

authRouter.post(
  '/login/email',
  { requestType: { body: loginUserByEmailSchema } },
  handleLoginByEmail,
);

authRouter.post('/logout', {}, handleLogout);

authRouter.get('/user', {}, canAccess(), handleGetCurrentUser);

authRouter.post(
  '/forget-password',
  { requestType: { body: forgetPasswordSchema } },
  handleForgetPassword,
);

authRouter.post(
  '/change-password',
  { requestType: { body: changePasswordSchema } },
  canAccess(),
  handleChangePassword,
);

authRouter.post(
  '/reset-password',
  { requestType: { body: resetPasswordSchema } },
  handleResetPassword,
);

authRouter.get('/google', {}, handleGoogleLogin);
authRouter.get('/google/callback', {}, handleGoogleCallback);

export default authRouter.getRouter();
