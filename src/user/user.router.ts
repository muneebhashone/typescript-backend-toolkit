import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleClearUsers,
  handleCreateSuperAdmin,
  handleCreateUser,
  handleGetUsers,
  handleToggleActive,
  handleUpdateUser,
  handleUpdateUserEmail,
  handleUpdateUserPhone,
  handleUserSeeder,
  handleVerifyUpdateOtp,
} from './user.controller';
import {
  createUserSchema,
  getUsersSchema,
  updateUserEmailSchema,
  updateUserPhoneNoSchema,
  updateUserSchema,
  userIdSchema,
  verifyUpdateOtpSchema,
} from './user.schema';

export const USER_ROUTER_ROOT = '/users';

const userRouter = Router();

userRouter.get('/seed', handleUserSeeder);

userRouter.delete('/_clear', handleClearUsers);

userRouter.get(
  '/:id/toggle-active',
  canAccess(),
  validateZodSchema({ params: userIdSchema }),
  handleToggleActive,
);

userRouter.put(
  '/user',
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({ body: updateUserSchema }),
  handleUpdateUser,
);

userRouter.get(
  '/',
  canAccess(),
  validateZodSchema({ query: getUsersSchema }),
  handleGetUsers,
);

userRouter.post(
  '/user',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: createUserSchema }),
  handleCreateUser,
);

userRouter.post('/_super-admin', handleCreateSuperAdmin);

userRouter.post(
  '/update/email',
  canAccess(),
  validateZodSchema({ body: updateUserEmailSchema }),
  handleUpdateUserEmail,
);

userRouter.post(
  '/update/phone',
  canAccess(),
  validateZodSchema({ body: updateUserPhoneNoSchema }),
  handleUpdateUserPhone,
);

userRouter.post(
  '/verify/update-code',
  canAccess(),
  validateZodSchema({ body: verifyUpdateOtpSchema }),
  handleVerifyUpdateOtp,
);

export default userRouter;
