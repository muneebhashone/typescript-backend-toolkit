import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prepareSetPasswordAndSendEmail } from '../auth/auth.service';
import { ConflictError } from '../errors/errors.service';
import { errorResponse, successResponse } from '../utils/api.utils';
import { generateRandomPassword } from '../utils/auth.utils';
import {
  BulkUserIdSchemaType,
  CreateUserSchemaType,
  GetUsersSchemaType,
  UpdateUserSchemaType,
  UserIdSchemaType,
} from './user.schema';
import {
  activeToggle,
  createUser,
  deleteBulkUsers,
  deleteUser,
  getUsers,
  seedUsers,
  updateUser,
} from './user.services';
import { UserType } from '../types';

export const handleToggleActive = async (
  req: Request<UserIdSchemaType>,
  res: Response,
) => {
  try {
    const status = await activeToggle(req.params.id);

    return successResponse(
      res,
      `Status changed to ${status ? 'Active' : 'Disabled'}`,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUserSeeder = async (_: Request, res: Response) => {
  try {
    const result = await seedUsers();

    return successResponse(res, 'Data seeded successfully', result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteBulkUsers = async (
  req: Request<never, never, never, BulkUserIdSchemaType>,
  res: Response,
) => {
  try {
    await deleteBulkUsers(req.query.ids);

    return successResponse(res, 'Users are deleted');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteUser = async (
  req: Request<UserIdSchemaType, never>,
  res: Response,
) => {
  try {
    await deleteUser(req.params.id);

    return successResponse(res, 'User has been deleted');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateUser = async (
  req: Request<never, never, UpdateUserSchemaType>,
  res: Response,
) => {
  try {
    const currentUser = req.user as UserType;

    const updatedUser = await updateUser(req.body, currentUser.id);

    return successResponse(res, 'Profile has been updated', updatedUser);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateUser = async (
  req: Request<never, never, CreateUserSchemaType>,
  res: Response,
) => {
  try {
    const data = req.body;

    const user = await createUser({
      ...data,
      password: generateRandomPassword(),
      isActive: true,
      role: 'DEFAULT_USER',
    });

    await prepareSetPasswordAndSendEmail(user);

    return res
      .status(StatusCodes.CREATED)
      .json({ message: 'Email has been sent to the user', data: user });
  } catch (err) {
    if (err instanceof ConflictError) {
      return errorResponse(res, err.message, StatusCodes.CONFLICT);
    }

    return errorResponse(
      res,
      (err as Error).message,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const handleCreateSuperAdmin = async (
  _: Request<never, never, never>,
  res: Response,
) => {
  try {
    const password = 'Pa$$w0rd!';

    const user = await createUser({
      email: 'admin@mailinator.com',
      firstName: 'Super',
      lastName: 'Admin',
      password: password,
      isActive: true,
      role: 'SUPER_ADMIN',
      phoneNo: '123456789',
      dob: '1999-02-19',
    });

    return res.status(StatusCodes.CREATED).json({
      message: 'Super Admin has been created',
      data: { email: user.email, password: password },
    });
  } catch (err) {
    if (err instanceof ConflictError) {
      return errorResponse(res, err.message, StatusCodes.CONFLICT);
    }

    return errorResponse(
      res,
      (err as Error).message,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const handleGetUsers = async (
  req: Request<never, never, never, GetUsersSchemaType>,
  res: Response,
) => {
  try {
    const { results, paginatorInfo } = await getUsers(
      Number(req.user.sub),
      req.query,
    );

    return res.json({ paginatorInfo: paginatorInfo, results: results });
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
