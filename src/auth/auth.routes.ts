import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleChangePassword,
  handleForgetPassword,
  handleGetCurrentUser,
  handleLogin,
  handleLogout,
  handleRegisterUser,
  handleResetPassword,
  handleSetPassword,
  handleVerifyOtp,
} from './auth.controller';
import {
  changePasswordSchema,
  forgetPasswordSchema,
  loginUserSchema,
  registerUserSchema,
  resetPasswordSchema,
  setPasswordSchema,
  verifyOtpSchema,
} from './auth.schema';

export const AUTH_ROUTER_ROOT = '/auth';

const authRouter = Router();

// Register a User (Client) under White Label Admin
authRouter.post(
  '/register/user',
  validateZodSchema({ body: registerUserSchema }),
  handleRegisterUser,
);

authRouter.post(
  '/login',
  validateZodSchema({ body: loginUserSchema }),
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
