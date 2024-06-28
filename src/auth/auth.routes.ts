import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleChangePassword,
  handleForgetPassword,
  handleGetCurrentUser,
  handleLogin,
  handleLogout,
  handleRegisterHost,
  handleRegisterUser,
  handleResetPassword,
  handleSetPassword,
  handleVerifyOtp,
} from './auth.controller';
import {
  changePasswordSchema,
  forgetPasswordSchema,
  loginUserByEmailSchema,
  registerHostByPhoneSchema,
  registerUserByEmailSchema,
  resetPasswordSchema,
  setPasswordSchema,
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
  '/register/host',
  validateZodSchema({ body: registerHostByPhoneSchema }),
  handleRegisterHost,
);

authRouter.post(
  '/login',
  validateZodSchema({ body: loginUserByEmailSchema }),
  handleLogin,
);

authRouter.post('/logout', handleLogout);

authRouter.post(
  '/verify-otp',
  validateZodSchema({ body: verifyOtpSchema }),
  handleVerifyOtp,
);

authRouter.get('/user', handleGetCurrentUser);

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

export default authRouter;
