import { canAccess } from '../middlewares/can-access.middleware';
import MagicRouter from '../openapi/magic-router';
import {
  handleChangePassword,
  handleForgetPassword,
  handleGetCurrentUser,
  handleGoogleCallback,
  handleGoogleLogin,
  handleLoginByEmail,
  handleLoginByPhone,
  handleLoginByPhoneAndPassword,
  handleLogout,
  handleRegisterUser,
  handleResetPassword,
  handleSetPassword,
  handleValidateLoginCode,
  handleVerifyOtp,
} from './auth.controller';
import {
  changePasswordSchema,
  forgetPasswordSchema,
  loginByPhoneAndPasswordSchema,
  loginUserByEmailSchema,
  loginUserByPhoneSchema,
  registerUserByEmailSchema,
  resetPasswordSchema,
  setPasswordSchema,
  validateLoginOtpSchema,
  verifyOtpSchema,
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

authRouter.post(
  '/login/phone-password',
  { requestType: { body: loginByPhoneAndPasswordSchema } },
  handleLoginByPhoneAndPassword,
);

authRouter.post(
  '/login/phone',
  { requestType: { body: loginUserByPhoneSchema } },
  handleLoginByPhone,
);

authRouter.post(
  '/verify-otp',
  { requestType: { body: verifyOtpSchema } },
  handleVerifyOtp,
);

authRouter.post(
  '/verify-code',
  { requestType: { body: validateLoginOtpSchema } },
  handleValidateLoginCode,
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

authRouter.post(
  '/set-password',
  { requestType: { body: setPasswordSchema } },
  handleSetPassword,
);

authRouter.get('/google', {}, handleGoogleLogin);
authRouter.get('/google/callback', {}, handleGoogleCallback);

export default authRouter.getRouter();
