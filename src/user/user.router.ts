import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleCreateSuperAdmin,
  handleCreateUser,
  handleGetUsers,
  handleToggleActive,
  handleUpdateHost,
  handleUpdateUser,
  handleUserSeeder,
} from './user.controller';
import {
  createUserSchema,
  getUsersSchema,
  updateHostSchema,
  updateUserSchema,
  userIdSchema,
} from './user.schema';

export const USER_ROUTER_ROOT = '/users';

const userRouter = Router();

userRouter.get('/seed', handleUserSeeder);

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

userRouter.put(
  '/host',
  canAccess('roles', ['VENDOR']),
  validateZodSchema({ body: updateHostSchema }),
  handleUpdateHost,
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

export default userRouter;
