import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../config/config.service';
import { ConflictError } from '../errors/errors.service';
import { SetPasswordEmailQueue } from '../queues/email.queue';
import { UserType } from '../types';
import { errorResponse } from '../utils/api.utils';
import {
  CreateCompanyAndUserSchema,
  GetCompaniesSchemaType,
} from './company.schema';
import { createCompanyAndUser, getCompanies } from './company.service';

export const handleGetCompanies = async (
  req: Request<never, never, never, GetCompaniesSchemaType>,
  res: Response,
) => {
  const currentUser = req.user as UserType;
  const { paginatorInfo, results } = await getCompanies(req.query, currentUser);

  return res.json({ paginatorInfo: paginatorInfo, results: results });
};

export const handleCreateCompanyAndUser = async (
  req: Request<never, never, CreateCompanyAndUserSchema>,
  res: Response,
) => {
  try {
    const userAndCompany = await createCompanyAndUser(req.body);

    await SetPasswordEmailQueue.add(
      String(userAndCompany.company.id + userAndCompany.user.id),
      {
        email: String(userAndCompany.user.email),
        name: String(userAndCompany.user.name),
        passwordSetLink: `${config.CLIENT_SIDE_URL}/set-password?email=${userAndCompany.user.email}`,
      },
    );

    return res.status(StatusCodes.CREATED).json({
      message: 'Email has been sent to the user',
      data: userAndCompany,
    });
  } catch (err) {
    if (err instanceof ConflictError) {
      return errorResponse(res, err.message, StatusCodes.CONFLICT);
    }

    return errorResponse(res, (err as Error).message);
  }
};
