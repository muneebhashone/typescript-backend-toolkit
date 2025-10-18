import { canAccess } from '../../middlewares/can-access';
import MagicRouter from '../../openapi/magic-router';
import {
  handleCreateSuperAdmin,
  handleCreateUser,
  handleGetUsers,
} from './user.controller';
import { 
  createUserSchema, 
  getUsersSchema,
  createUserResponseSchema,
  getUsersResponseSchema,
  createSuperAdminResponseSchema,
} from './user.schema';

export const USER_ROUTER_ROOT = '/users';

const userRouter = new MagicRouter(USER_ROUTER_ROOT);

// List users with pagination
userRouter.get(
  '/',
  {
    requestType: { query: getUsersSchema },
    responses: {
      200: getUsersResponseSchema,
    },
  },
  canAccess(),
  handleGetUsers,
);

// Create user (admin only)
userRouter.post(
  '/user',
  {
    requestType: { body: createUserSchema },
    responses: {
      201: createUserResponseSchema,
    },
  },
  canAccess('roles', ['SUPER_ADMIN']),
  handleCreateUser,
);

// Create super admin (initial setup)
userRouter.post(
  '/_super-admin',
  {
    responses: {
      201: createSuperAdminResponseSchema,
    },
  },
  handleCreateSuperAdmin,
);

export default userRouter.getRouter();
