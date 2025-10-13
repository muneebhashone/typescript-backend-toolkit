import { z } from 'zod';
import { canAccess } from '../../middlewares/can-access';
import MagicRouter from '../../openapi/magic-router';
import { R } from '../../openapi/response.builders';
import {
  handleCreateSuperAdmin,
  handleCreateUser,
  handleGetUsers,
} from './user.controller';
import { userOutSchema } from './user.dto';
import { createUserSchema, getUsersSchema } from './user.schema';

export const USER_ROUTER_ROOT = '/users';

const userRouter = new MagicRouter(USER_ROUTER_ROOT);

// List users with pagination
userRouter.get(
  '/',
  {
    requestType: { query: getUsersSchema },
    responses: {
      200: R.paginated(userOutSchema),
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
      201: R.success(userOutSchema),
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
      201: R.success(
        z.object({
          email: z.string().email(),
          password: z.string(),
        }),
      ),
    },
  },
  handleCreateSuperAdmin,
);

export default userRouter.getRouter();
