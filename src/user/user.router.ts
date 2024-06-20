import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleAssignCredits,
  handleCreateClientSuperUser,
  handleCreateClientUser,
  handleCreateSubAdmin,
  handleCreateSuperAdmin,
  handleCreateWhiteLabelAdmin,
  handleCreateWhiteLabelSubAdmin,
  handleDeleteBulkUsers,
  handleDeleteUser,
  handleGetUsers,
  handleToggleActive,
  handleUpdatePermissions,
  handleUserSeeder,
  handleUserStatusEdit,
} from './user.controller';
import {
  assignCreditsSchema,
  bulkUserIdsSchema,
  createClientSuperUserSchema,
  createClientUserSchema,
  createSubAdminSchema,
  createWhiteLabelAdminSchema,
  createWhiteLabelSubAdminSchema,
  getUsersSchema,
  userIdSchema,
  userPermissionsSchema,
  userStatusSchema,
} from './user.schema';

export const USER_ROUTER_ROOT = '/users';

const userRouter = Router();

userRouter.get('/seed', handleUserSeeder);

userRouter.post(
  '/:id/credits',
  canAccess(),
  validateZodSchema({ params: userIdSchema, body: assignCreditsSchema }),
  handleAssignCredits,
);

userRouter.get(
  '/:id/toggle-active',
  canAccess(),
  validateZodSchema({ params: userIdSchema }),
  handleToggleActive,
);

userRouter.get(
  '/',
  canAccess(),
  validateZodSchema({ query: getUsersSchema }),
  handleGetUsers,
);

userRouter.delete(
  '/bulk',
  canAccess('permissions', ['DELETE_USER']),
  validateZodSchema({ query: bulkUserIdsSchema }),
  handleDeleteBulkUsers,
);

userRouter.delete(
  '/:id',
  canAccess('permissions', ['DELETE_USER']),
  validateZodSchema({ params: userIdSchema }),
  handleDeleteUser,
);

userRouter.post(
  '/:id/permissions',
  canAccess('permissions', ['EDIT_USER']),
  validateZodSchema({ params: userIdSchema, body: userPermissionsSchema }),
  handleUpdatePermissions,
);

userRouter.post(
  '/client-user',
  canAccess('roles', ['CLIENT_SUPER_USER']),
  validateZodSchema({ body: createClientUserSchema }),
  handleCreateClientUser,
);

userRouter.post(
  '/client-super-user',
  canAccess('roles', ['WHITE_LABEL_ADMIN', 'WHITE_LABEL_SUB_ADMIN']),
  validateZodSchema({ body: createClientSuperUserSchema }),
  handleCreateClientSuperUser,
);

userRouter.post(
  '/white-label-sub-admin',
  canAccess('roles', ['WHITE_LABEL_ADMIN']),
  validateZodSchema({ body: createWhiteLabelSubAdminSchema }),
  handleCreateWhiteLabelSubAdmin,
);

userRouter.post(
  '/white-label-admin',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: createWhiteLabelAdminSchema }),
  handleCreateWhiteLabelAdmin,
);

userRouter.post(
  '/sub-admin',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: createSubAdminSchema }),
  handleCreateSubAdmin,
);

userRouter.post('/_super-admin', handleCreateSuperAdmin);

userRouter.post(
  '/:id/status',
  canAccess('roles', [
    'WHITE_LABEL_ADMIN',
    'SUPER_ADMIN',
    'SUB_ADMIN',
    'CLIENT_SUPER_USER',
  ]),
  validateZodSchema({ body: userStatusSchema, params: userIdSchema }),
  handleUserStatusEdit,
);

export default userRouter;
