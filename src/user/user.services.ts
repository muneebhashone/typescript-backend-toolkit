import {
  InferInsertModel,
  InferSelectModel,
  SQL,
  and,
  count,
  eq,
  ilike,
  inArray,
  or,
} from 'drizzle-orm';
import { db } from '../drizzle/db';
import { PermissionsType, RoleType } from '../drizzle/enums';
import { companies, users } from '../drizzle/schema';
import { ConflictError, NotFoundError } from '../errors/errors.service';
import { hashPassword } from '../utils/auth.utils';
import { GetPaginatorReturnType, getPaginator } from '../utils/getPaginator';
import { GetUsersSchemaType, UserStatusSchemaType } from './user.schema';
import { DefaultPermissions } from './user.constants';
import { createCompany } from '../company/company.service';
import { UserType } from '../types';

export const assignCredits = async (userId: number, credits: number) => {
  await db
    .update(users)
    .set({ credits: credits })
    .where(eq(users.id, userId))
    .execute();
};

export const activeToggle = async (userId: number) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) {
    throw new Error('User not found');
  }

  const toggleStatus = !user.isActive;

  await db
    .update(users)
    .set({ isActive: toggleStatus })
    .where(eq(users.id, userId))
    .execute();

  return toggleStatus;
};

export const getUserById = async (
  userId: number,
): Promise<InferSelectModel<typeof users>> => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export type GetUsersReturnType = {
  results: InferSelectModel<typeof users>[];
  paginatorInfo: GetPaginatorReturnType;
};

export const deleteUser = async (userId: number) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (user?.role === 'SUPER_ADMIN') {
    throw new Error("SUPER_ADMIN can't be deleted");
  }

  await db.delete(users).where(eq(users.id, userId)).execute();
};

export const deleteBulkUsers = async (userIds: number[]) => {
  const manyUsers = await db.query.users.findMany({
    where: inArray(users.id, userIds),
  });

  const isThereAnySuperAdmin = manyUsers.some(
    (singleUser) => singleUser.role === 'SUPER_ADMIN',
  );

  if (isThereAnySuperAdmin) {
    throw new Error("SUPER_ADMIN can't be deleted");
  }

  await db.delete(users).where(inArray(users.id, userIds)).execute();
};

export const RolesMapper: Record<RoleType, RoleType[]> = {
  CLIENT_SUPER_USER: ['CLIENT_USER'],
  SUPER_ADMIN: [
    'CLIENT_SUPER_USER',
    'SUB_ADMIN',
    'WHITE_LABEL_ADMIN',
    'WHITE_LABEL_SUB_ADMIN',
  ],
  WHITE_LABEL_ADMIN: ['WHITE_LABEL_SUB_ADMIN', 'CLIENT_SUPER_USER'],
  WHITE_LABEL_SUB_ADMIN: ['CLIENT_SUPER_USER'],
  CLIENT_USER: [],
  SUB_ADMIN: [
    'CLIENT_SUPER_USER',
    'WHITE_LABEL_ADMIN',
    'WHITE_LABEL_SUB_ADMIN',
  ],
};

export const MustHaveCompanyIds: RoleType[] = [
  'CLIENT_SUPER_USER',
  'WHITE_LABEL_ADMIN',
  'WHITE_LABEL_SUB_ADMIN',
];

export const getUsers = async (
  userId: number,
  payload: GetUsersSchemaType,
): Promise<GetUsersReturnType> => {
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!currentUser) {
    throw new Error('User must be logged in');
  }

  let filter: SQL<unknown> | null = null;
  const andConditions: (SQL<unknown> | undefined)[] = [];

  const rolesToSearchFor: RoleType[] = RolesMapper[currentUser.role];

  if (MustHaveCompanyIds.includes(currentUser.role)) {
    andConditions.push(eq(users.companyId, Number(currentUser.companyId)));
  }

  if (payload.searchString) {
    andConditions.push(
      or(
        ilike(users.name, `%${payload.searchString}%`),
        ilike(users.email, `%${payload.searchString}%`),
      ),
    );
  }

  if (payload.filterByActive) {
    andConditions.push(eq(users.isActive, payload.filterByActive));
  }

  if (payload.filterByRole) {
    andConditions.push(eq(users.role, payload.filterByRole));
  }

  if (payload.filterByStatus) {
    andConditions.push(eq(users.status, payload.filterByStatus));
  }

  andConditions.push(inArray(users.role, rolesToSearchFor));

  filter = and(...andConditions) as SQL<unknown>;

  const totalRecords = await db
    .select({ count: count(users.id) })
    .from(users)
    .where(filter)
    .execute();

  const paginatorInfo = getPaginator(
    payload.limitParam,
    payload.pageParam,
    totalRecords[0].count,
  );

  const results = await db.query.users.findMany({
    where: filter,
    limit: paginatorInfo.limit,
    offset: paginatorInfo.skip,
  });

  return {
    results,
    paginatorInfo,
  };
};

export const updateUserPermissions = async (
  userId: number,
  permissions: PermissionsType[],
): Promise<void> => {
  await getUserById(userId);

  await db
    .update(users)
    .set({ permissions: permissions })
    .where(eq(users.id, userId))
    .execute();
};

export const userStatusChange = async (
  id: number,
  payload: UserStatusSchemaType,
): Promise<InferSelectModel<typeof users>> => {
  const user = (
    await db
      .update(users)
      .set({ status: payload.status })
      .where(eq(users.id, id))
      .returning()
      .execute()
  )[0];

  if (user.companyId && user.role === 'CLIENT_SUPER_USER') {
    await db
      .update(companies)
      .set({ status: payload.status })
      .where(eq(companies.id, user.companyId))
      .returning()
      .execute();
  }

  return user;
};

export const createUser = async (
  payload: InferInsertModel<typeof users> & { password: string },
  checkExist: boolean = true,
): Promise<UserType> => {
  if (checkExist) {
    const isUserExist = await db.query.users.findFirst({
      where: eq(users.email, payload.email),
    });
    if (isUserExist) {
      throw new ConflictError('User already exists with a same email address');
    }
  }

  if (!payload.password) {
    throw new Error('Password is required');
  }

  const hashedPassword = await hashPassword(payload.password);

  const createdUser = (
    await db
      .insert(users)
      .values({
        ...payload,
        password: hashedPassword,
      })
      .returning()
      .execute()
  )[0];

  return { ...createdUser, password: '' };
};

export type SeedUsersReturn = {
  company: InferSelectModel<typeof companies>;
  superAdmin: InferSelectModel<typeof users>;
  whiteLabelAdmin: InferSelectModel<typeof users>;
  clientSuperUser: InferSelectModel<typeof users>;
};

export const seedUsers = async (): Promise<SeedUsersReturn> => {
  await db.delete(companies).execute();
  await db.delete(users).execute();

  const password = 'Pa$$w0rd!';

  const company = await createCompany(
    {
      city: 'New York',
      country: 'United States',
      companyName: 'Zim White Label Company',
    },
    'APPROVED',
  );

  // Super Admin
  const superAdmin = await createUser({
    email: 'zim-admin@mailinator.com',
    name: 'Zim Super Admin',
    credits: 1000,
    password: password,
    status: 'APPROVED',
    isActive: true,
    role: 'SUPER_ADMIN',
    permissions: DefaultPermissions['SUPER_ADMIN'],
  });

  // White Label Admin
  const whiteLabelAdmin = await createUser({
    email: 'zim-white-label-admin@mailinator.com',
    name: 'Zim Super Admin',
    credits: 1000,
    password: password,
    status: 'APPROVED',
    isActive: true,
    role: 'WHITE_LABEL_ADMIN',
    companyId: company.id,
    permissions: DefaultPermissions['WHITE_LABEL_ADMIN'],
  });

  // Client Super User
  const clientSuperUser = await createUser({
    email: 'zim-client-super-user@mailinator.com',
    name: 'Zim Client Super User',
    credits: 1000,
    password: password,
    status: 'APPROVED',
    isActive: true,
    role: 'CLIENT_SUPER_USER',
    companyId: company.id,
    permissions: DefaultPermissions['CLIENT_SUPER_USER'],
  });

  return { company, superAdmin, clientSuperUser, whiteLabelAdmin };
};
