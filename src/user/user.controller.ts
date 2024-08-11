import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prepareSetPasswordAndSendEmail } from '../auth/auth.service';
import { ConflictError } from '../errors/errors.service';
import { errorResponse, successResponse } from '../utils/api.utils';
import { generateRandomPassword, JwtPayload } from '../utils/auth.utils';
import {
  CreateUserSchemaType,
  GetUsersSchemaType,
  UpdateUserEmailSchemaType,
  UpdateUserPhoneSchemaType,
  UpdateUserSchemaType,
  UserIdSchemaType,
  VerifyUpdateOtpSchemaType,
} from './user.schema';
import { seedManyUsers, USERS_TO_SEED } from './user.seeder';
import {
  activeToggle,
  clearUsers,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  updateUserEmail,
  updateUserPhone,
  verifyUpdateOtp,
} from './user.services';

export const handleVerifyUpdateOtp = async (
  req: Request<never, never, VerifyUpdateOtpSchemaType>,
  res: Response,
) => {
  try {
    const currentUser = req.user;

    await verifyUpdateOtp(req.body, { id: currentUser.sub });

    return successResponse(res, `${req.body.for} has been updated`);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateUserEmail = async (
  req: Request<never, never, UpdateUserEmailSchemaType>,
  res: Response,
) => {
  try {
    const currentUser = req.user as JwtPayload;

    await updateUserEmail(req.body, { id: currentUser.sub });

    return successResponse(
      res,
      `Verification code has been successfuly sent to ${req.body.email}`,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateUserPhone = async (
  req: Request<never, never, UpdateUserPhoneSchemaType>,
  res: Response,
) => {
  try {
    const currentUser = req.user as JwtPayload;

    await updateUserPhone(req.body, { id: currentUser.sub });

    const phoneNo = `********${req.body.phoneNo.slice(-3)}`;

    return successResponse(
      res,
      `Verification code has been successfuly sent to ${phoneNo}`,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleToggleActive = async (
  req: Request<UserIdSchemaType>,
  res: Response,
) => {
  try {
    const status = await activeToggle({ id: req.params.id });

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
    // const result = await seedUsers();
    const result = await seedManyUsers(USERS_TO_SEED);

    return successResponse(res, 'Data seeded successfully', result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteUser = async (
  req: Request<UserIdSchemaType, never>,
  res: Response,
) => {
  try {
    await deleteUser({ id: req.params.id });

    return successResponse(res, 'User has been deleted');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleClearUsers = async (_: Request, res: Response) => {
  try {
    await clearUsers();

    return successResponse(res, 'Users table is cleared');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateUser = async (
  req: Request<never, never, UpdateUserSchemaType>,
  res: Response,
) => {
  try {
    const currentUser = req.user as JwtPayload;
    const body = { ...req.body, dob: new Date(req.body.dob as string) };
    const updatedUser = await updateUser(body, { id: currentUser.sub });

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
      ...(req.body?.dob ? { dob: new Date(req.body.dob) } : {}),
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
      dob: new Date(),
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
      {
        id: req.user.sub,
      },
      req.query,
    );

    return res.json({ paginatorInfo: paginatorInfo, results: results });
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
