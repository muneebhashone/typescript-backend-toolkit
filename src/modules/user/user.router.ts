import { canAccess } from '../../middlewares/can-access.middleware';
import MagicRouter from '../../openapi/magic-router';
import RouteRoots from '../../routes/roots';
import {
  handleCreateSuperAdmin,
  handleCreateUser,
  handleGetUsers,
} from './user.controller';
import { usersPaginatedSchema } from './user.dto';
import { createUserSchema, getUsersSchema } from './user.schema';

const userRouter = new MagicRouter(RouteRoots.USER);

userRouter.get(
  '/',
  {
    requestType: { query: getUsersSchema },
    responseModel: usersPaginatedSchema,
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

export default userRouter.getRouter();
