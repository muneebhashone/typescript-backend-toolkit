import type { Request } from 'express';
import type { MongoIdSchemaType } from '../../common/common.schema';
import config from '../../config/env';
import type { ResponseExtended } from '../../types';
import { successResponse } from '../../utils/response.utils';
import { generateRandomPassword } from '../../utils/otp.utils';
import type {
  CreateUserSchemaType,
  GetUsersSchemaType,
  CreateUserResponseSchema,
  GetUsersResponseSchema,
  CreateSuperAdminResponseSchema,
} from './user.schema';
import { createUser, deleteUser, getUsers } from './user.services';
import { Types } from 'mongoose';

export const handleDeleteUser = async (
  req: Request<MongoIdSchemaType, unknown>,
  res: ResponseExtended,
) => {
  await deleteUser({ id: req.params.id });

  return successResponse(res, 'User has been deleted');
};

// Using new res.created() helper
export const handleCreateUser = async (
  req: Request<unknown, unknown, CreateUserSchemaType>,
  res: ResponseExtended<CreateUserResponseSchema>,
) => {
  const data = req.body;

  const user = await createUser({
    ...data,
    password: generateRandomPassword(),
    role: 'DEFAULT_USER',
  });

  return res.created?.({
    success: true,
    message: 'Email has been sent to the user',
    data: user,
  });
};

// Using new res.created() helper
export const handleCreateSuperAdmin = async (
  _: Request<unknown, unknown, unknown>,
  res: ResponseExtended<CreateSuperAdminResponseSchema>,
) => {
  const user = await createUser({
    email: config.ADMIN_EMAIL,
    name: 'Super Admin',
    username: 'super_admin',
    password: config.ADMIN_PASSWORD,
    role: 'SUPER_ADMIN',
    phoneNo: '123456789',
    otp: null,
  });

  return res.created?.({
    success: true,
    message: 'Super Admin has been created',
    data: { email: user.email, password: config.ADMIN_PASSWORD },
  });
};

// Using new res.ok() helper with paginated response
export const handleGetUsers = async (
  req: Request<unknown, unknown, unknown, GetUsersSchemaType>,
  res: ResponseExtended<GetUsersResponseSchema>,
) => {
  const { results, paginatorInfo } = await getUsers(
    {
      id: new Types.ObjectId(req.user.sub),
    },
    req.query,
  );

  return res.ok?.({
    success: true,
    data: {
      items: results,
      paginator: paginatorInfo,
    },
  });
};
