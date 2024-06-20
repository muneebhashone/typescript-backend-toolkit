import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prepareSetPasswordAndSendEmail } from '../auth/auth.service';
import { createCompany } from '../company/company.service';
import { db } from '../drizzle/db';
import { companies, users } from '../drizzle/schema';
import { ConflictError } from '../errors/errors.service';
import { UserType } from '../types';
import { errorResponse, successResponse } from '../utils/api.utils';
import { generateRandomPassword } from '../utils/auth.utils';
import { DefaultPermissions } from './user.constants';
import {
  AssignCreditsSchemaType,
  BulkUserIdSchemaType,
  CreateClientSuperUserSchema,
  CreateClientUserSchemaType,
  CreateWhiteLabelAdminSchema,
  CreateWhiteLabelSubAdminSchema,
  GetUsersSchemaType,
  UserIdSchemaType,
  UserPermissionsSchemaType,
  UserStatusSchemaType,
} from './user.schema';
import {
  activeToggle,
  assignCredits,
  createUser,
  deleteBulkUsers,
  deleteUser,
  getUsers,
  seedUsers,
  updateUserPermissions,
  userStatusChange,
} from './user.services';

export const handleAssignCredits = async (
  req: Request<UserIdSchemaType, never, AssignCreditsSchemaType>,
  res: Response,
) => {
  try {
    await assignCredits(req.params.id, req.body.credits);

    return successResponse(res, `Credits assigned`);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

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

export const handleUpdatePermissions = async (
  req: Request<UserIdSchemaType, never, UserPermissionsSchemaType>,
  res: Response,
) => {
  try {
    await updateUserPermissions(req.params.id, req.body.permissions);

    return successResponse(res, 'Permissions updated');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUserStatusEdit = async (
  req: Request<UserIdSchemaType, never, UserStatusSchemaType>,
  res: Response,
) => {
  try {
    const userId = req.params.id;
    const status = req.body.status;

    const result = await userStatusChange(userId, { status: status });

    res.json(result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateClientUser = async (
  req: Request<never, never, CreateClientUserSchemaType>,
  res: Response,
) => {
  try {
    const data = req.body;

    const currentUser = req.user as UserType;

    const user = await createUser({
      ...data,
      password: generateRandomPassword(),
      status: 'APPROVED',
      clientId: currentUser.id,
      companyId: currentUser.companyId,
      isActive: true,
      role: 'CLIENT_USER',
      permissions: DefaultPermissions['CLIENT_USER'],
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

export const handleCreateClientSuperUser = async (
  req: Request<never, never, CreateClientSuperUserSchema>,
  res: Response,
) => {
  try {
    const data = req.body;

    const currentUser = req.user as UserType;

    const user = await createUser({
      ...data,
      password: generateRandomPassword(),
      isActive: true,
      companyId: currentUser.companyId,
      status: 'APPROVED',
      role: 'CLIENT_SUPER_USER',
      permissions: DefaultPermissions['CLIENT_SUPER_USER'],
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

export const handleCreateWhiteLabelSubAdmin = async (
  req: Request<never, never, CreateWhiteLabelSubAdminSchema>,
  res: Response,
) => {
  try {
    const data = req.body;

    const currentUser = req.user as UserType;

    const user = await createUser({
      ...data,
      password: generateRandomPassword(),
      companyId: currentUser.companyId,
      isActive: true,
      status: 'APPROVED',
      role: 'WHITE_LABEL_SUB_ADMIN',
      permissions: DefaultPermissions['WHITE_LABEL_SUB_ADMIN'],
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

export const handleCreateWhiteLabelAdmin = async (
  req: Request<never, never, CreateWhiteLabelAdminSchema>,
  res: Response,
) => {
  try {
    const { companyName, country, city, ...data } = req.body;

    const isCompanyExist = await db.query.companies.findFirst({
      where: eq(companies.name, companyName.toLowerCase()),
    });

    if (isCompanyExist) {
      throw new ConflictError('Company already exist with a same name');
    }

    const isUserExist = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (isUserExist) {
      throw new ConflictError('User already exists with a same email address');
    }

    const company = await createCompany(
      {
        companyName,
        city,
        country,
      },
      'APPROVED',
      false,
    );

    const user = await createUser(
      {
        ...data,
        password: generateRandomPassword(),
        status: 'APPROVED',
        isActive: true,
        companyId: company.id,
        role: 'WHITE_LABEL_ADMIN',
        permissions: DefaultPermissions['WHITE_LABEL_ADMIN'],
      },
      false,
    );

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
      email: 'zim-admin@mailinator.com',
      name: 'Zim Super Admin',
      credits: 1000,
      password: password,
      status: 'APPROVED',
      isActive: true,
      role: 'SUPER_ADMIN',
      permissions: DefaultPermissions['SUPER_ADMIN'],
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

export const handleCreateSubAdmin = async (
  _: Request<never, never, never>,
  res: Response,
) => {
  try {
    const user = await createUser({
      email: 'zim-admin@mailinator.com',
      name: 'Zim Super Admin',
      credits: 1000,
      password: generateRandomPassword(),
      status: 'APPROVED',
      isActive: true,
      role: 'SUB_ADMIN',
      permissions: DefaultPermissions['SUB_ADMIN'],
    });

    await prepareSetPasswordAndSendEmail(user);

    return res.status(StatusCodes.CREATED).json({
      message: 'Email has been sent to the user',
      data: user,
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
