import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
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

const authRouter = Router();

authRouter.post(
  '/register/user',
  validateZodSchema({ body: registerUserByEmailSchema }),
  handleRegisterUser,
);

authRouter.post(
  '/login/email',
  validateZodSchema({ body: loginUserByEmailSchema }),
  handleLoginByEmail,
);

authRouter.post(
  '/login/phone-password',
  validateZodSchema({ body: loginByPhoneAndPasswordSchema }),
  handleLoginByPhoneAndPassword,
);

authRouter.post(
  '/login/phone',
  validateZodSchema({ body: loginUserByPhoneSchema }),
  handleLoginByPhone,
);

authRouter.post(
  '/verify-otp',
  validateZodSchema({ body: verifyOtpSchema }),
  handleVerifyOtp,
);

authRouter.post(
  '/verify-code',
  validateZodSchema({ body: validateLoginOtpSchema }),
  handleValidateLoginCode,
);

authRouter.post('/logout', handleLogout);

authRouter.get('/user', canAccess(), handleGetCurrentUser);

authRouter.post(
  '/forget-password',
  validateZodSchema({ body: forgetPasswordSchema }),
  handleForgetPassword,
);

authRouter.post(
  '/change-password',
  canAccess(),
  validateZodSchema({ body: changePasswordSchema }),
  handleChangePassword,
);

authRouter.post(
  '/reset-password',
  validateZodSchema({ body: resetPasswordSchema }),
  handleResetPassword,
);

authRouter.post(
  '/set-password',
  validateZodSchema({ body: setPasswordSchema }),
  handleSetPassword,
);

authRouter.get('/google', handleGoogleLogin);
authRouter.get('/google/callback', handleGoogleCallback);

export default authRouter;
