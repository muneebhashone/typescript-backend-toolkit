import { InferSelectModel, SQL, and, count, eq, ilike } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { StatusType } from '../drizzle/enums';
import { companies, users } from '../drizzle/schema';
import { ConflictError, NotFoundError } from '../errors/errors.service';
import { UserType } from '../types';
import { createUser } from '../user/user.services';
import { generateRandomPassword } from '../utils/auth.utils';
import { sanitizeRecord } from '../utils/common.utils';
import { GetPaginatorReturnType, getPaginator } from '../utils/getPaginator';
import {
  CreateCompanyAndUserSchema,
  CreateCompanySchemaType,
  GetCompaniesSchemaType,
} from './company.schema';

export const getCompanyById = async (
  id: number,
): Promise<InferSelectModel<typeof companies> | null> => {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, id),
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return company;
};

export type GetCompaniesReturnType = {
  results: InferSelectModel<typeof companies>[];
  paginatorInfo: GetPaginatorReturnType;
};

export const getCompanies = async (
  payload: GetCompaniesSchemaType,
  user?: UserType,
): Promise<GetCompaniesReturnType> => {
  const filter: SQL<unknown>[] = [];

  if (user?.role !== 'SUPER_ADMIN') {
    filter.push(eq(companies.status, 'APPROVED'));
  }

  if (payload.searchString) {
    filter.push(ilike(companies.name, `%${payload.searchString}%`));
  }

  const totalRecords = await db
    .select({ count: count(companies.id) })
    .from(companies)
    .where(and(...filter))
    .execute();

  const paginatorInfo = getPaginator(
    payload.limitParam,
    payload.pageParam,
    totalRecords[0].count,
  );

  const results = await db.query.companies.findMany({
    limit: paginatorInfo.limit,
    offset: paginatorInfo.skip,
    where: and(...filter),
  });

  return { results, paginatorInfo };
};

export const createCompany = async (
  payload: CreateCompanySchemaType,
  status: StatusType = 'REQUESTED',
  checkExist: boolean = true,
): Promise<InferSelectModel<typeof companies>> => {
  if (checkExist) {
    const isCompanyExist = await db.query.companies.findFirst({
      where: eq(companies.name, payload.companyName.toLowerCase()),
    });

    if (isCompanyExist) {
      throw new ConflictError('Company already exist with a same name');
    }
  }

  const company = (
    await db
      .insert(companies)
      .values(
        sanitizeRecord({
          name: payload.companyName.toLowerCase(),
          country: payload.country,
          city: payload.city,
          status: status,
        }),
      )
      .returning()
      .execute()
  )[0];

  return company;
};

export type CreateCompanyAndUserReturnType = {
  user: InferSelectModel<typeof users>;
  company: InferSelectModel<typeof companies>;
};

export const createCompanyAndUser = async (
  payload: CreateCompanyAndUserSchema,
): Promise<CreateCompanyAndUserReturnType> => {
  const isCompanyExist = await db.query.companies.findFirst({
    where: eq(companies.name, payload.companyName.toLowerCase()),
  });

  if (isCompanyExist) {
    throw new ConflictError('Company already exist with a same name');
  }

  const isUserExist = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (isUserExist) {
    throw new ConflictError('User already exists with a same email address');
  }

  const company = await createCompany(
    {
      companyName: payload.companyName,
      city: payload.city,
      country: payload.country,
    },
    'APPROVED',
    false,
  );

  const user = await createUser(
    {
      companyId: company.id,
      email: payload.email,
      name: payload.name,
      password: generateRandomPassword(),
      role: 'WHITE_LABEL_ADMIN',
      permissions: [
        'VIEW_DASHBOARD',
        'CREATE_USER',
        'CREATE_SHIPMENT',
        'DELETE_SHIPMENT',
        'DELETE_USER',
        'EDIT_SHIPMENT',
        'EDIT_USER',
      ],
      status: 'APPROVED',
    },
    false,
  );

  return { user, company };
};
