import z from 'zod';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import MagicRouter from '../openapi/magic-router';
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

const userRouter = new MagicRouter(USER_ROUTER_ROOT);

userRouter.get('/seed', {}, handleUserSeeder);

userRouter.delete('/_clear', {}, handleClearUsers);

userRouter.get(
  '/:id/toggle-active',
  {
    requestType: { params: userIdSchema, body: createUserSchema },
    responseModel: z.string(),
  },
  canAccess(),
  handleToggleActive,
);

userRouter.put(
  '/user',
  {},
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({ body: updateUserSchema }),
  handleUpdateUser,
);

userRouter.get(
  '/',
  {
    requestType: { query: getUsersSchema },
  },
  canAccess(),
  handleGetUsers,
);

userRouter.post(
  '/user',
  { requestType: { body: createUserSchema } },
  canAccess('roles', ['SUPER_ADMIN']),
  handleCreateUser,
);

userRouter.post('/_super-admin', {}, handleCreateSuperAdmin);

userRouter.post(
  '/update/email',
  { requestType: { body: updateUserEmailSchema } },
  canAccess(),
  handleUpdateUserEmail,
);

userRouter.post(
  '/update/phone',
  { requestType: { body: updateUserPhoneNoSchema } },
  canAccess(),
  handleUpdateUserPhone,
);

userRouter.post(
  '/verify/update-code',
  { requestType: { body: verifyUpdateOtpSchema } },
  canAccess(),
  handleVerifyUpdateOtp,
);

export default userRouter.getRouter();
