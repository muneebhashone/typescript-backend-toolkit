import { canAccess } from '../../middlewares/can-access.middleware';
import MagicRouter from '../../openapi/magic-router';
import {
  handleChangePassword,
  handleForgetPassword,
  handleGetCurrentUser,
  handleGoogleTokenVerification,
  handleLoginByEmail,
  handleLogout,
  handleRegisterUser,
  handleResetPassword,
} from './auth.controller';
import {
  changePasswordSchema,
  forgetPasswordSchema,
  googleTokenVerificationSchema,
  loginUserByEmailSchema,
  registerUserByEmailSchema,
  resetPasswordSchema,
} from './auth.schema';

export const AUTH_ROUTER_ROOT = '/auth';

const authRouter = new MagicRouter(AUTH_ROUTER_ROOT);

authRouter.post(
  '/login/email',
  { requestType: { body: loginUserByEmailSchema } },
  handleLoginByEmail,
);

authRouter.post(
  '/register/email',
  { requestType: { body: registerUserByEmailSchema } },
  handleRegisterUser,
);

authRouter.post('/logout', {}, handleLogout);

authRouter.get('/me', {}, canAccess(), handleGetCurrentUser);

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

authRouter.post(
  '/google/token',
  { requestType: { body: googleTokenVerificationSchema } },
  handleGoogleTokenVerification,
);
export default authRouter.getRouter();
