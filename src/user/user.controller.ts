import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prepareSetPasswordAndSendEmail } from '../auth/auth.service';
import { successResponse } from '../utils/api.utils';
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
  req: Request<unknown, unknown, VerifyUpdateOtpSchemaType>,
  res: Response,
) => {
  const currentUser = req.user;

  await verifyUpdateOtp(req.body, { id: currentUser.sub });

  return successResponse(res, `${req.body.for} has been updated`);
};

export const handleUpdateUserEmail = async (
  req: Request<unknown, unknown, UpdateUserEmailSchemaType>,
  res: Response,
) => {
  const currentUser = req.user as JwtPayload;

  await updateUserEmail(req.body, { id: currentUser.sub });

  return successResponse(
    res,
    `Verification code has been successfuly sent to ${req.body.email}`,
  );
};

export const handleUpdateUserPhone = async (
  req: Request<unknown, unknown, UpdateUserPhoneSchemaType>,
  res: Response,
) => {
  const currentUser = req.user as JwtPayload;

  await updateUserPhone(req.body, { id: currentUser.sub });

  const phoneNo = `********${req.body.phoneNo.slice(-3)}`;

  return successResponse(
    res,
    `Verification code has been successfuly sent to ${phoneNo}`,
  );
};

export const handleToggleActive = async (
  req: Request<UserIdSchemaType>,
  res: Response,
) => {
  const status = await activeToggle({ id: req.params.id });

  return successResponse(
    res,
    `Status changed to ${status ? 'Active' : 'Disabled'}`,
  );
};

export const handleUserSeeder = async (_: Request, res: Response) => {
  const result = await seedManyUsers(USERS_TO_SEED);
  return successResponse(res, 'Data seeded successfully', result);
};

export const handleDeleteUser = async (
  req: Request<UserIdSchemaType, unknown>,
  res: Response,
) => {
  await deleteUser({ id: req.params.id });

  return successResponse(res, 'User has been deleted');
};

export const handleClearUsers = async (_: Request, res: Response) => {
  await clearUsers();

  return successResponse(res, 'Users table is cleared');
};

export const handleUpdateUser = async (
  req: Request<unknown, unknown, UpdateUserSchemaType>,
  res: Response,
) => {
  const currentUser = req.user as JwtPayload;
  const body = { ...req.body, dob: new Date(req.body.dob as string) };
  const updatedUser = await updateUser(body, { id: currentUser.sub });

  return successResponse(res, 'Profile has been updated', updatedUser);
};

export const handleCreateUser = async (
  req: Request<unknown, unknown, CreateUserSchemaType>,
  res: Response,
) => {
  const data = req.body;

  const user = await createUser({
    ...data,
    password: generateRandomPassword(),
    isActive: true,
    role: 'DEFAULT_USER',
    ...(req.body?.dob ? { dob: new Date(req.body.dob) } : {}),
  });

  await prepareSetPasswordAndSendEmail(user);

  return successResponse(
    res,
    'Email has been sent to the user',
    user,
    StatusCodes.CREATED,
  );
};

export const handleCreateSuperAdmin = async (
  _: Request<unknown, unknown, unknown>,
  res: Response,
) => {
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

  return successResponse(
    res,
    'Super Admin has been created',
    user,
    StatusCodes.CREATED,
  );
};

export const handleGetUsers = async (
  req: Request<unknown, unknown, unknown, GetUsersSchemaType>,
  res: Response,
) => {
  const { results, paginatorInfo } = await getUsers(
    {
      id: req.user.sub,
    },
    req.query,
  );

  return successResponse(res, undefined, { results, paginatorInfo });
};
