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
import { users } from '../drizzle/schema';
import { ConflictError, NotFoundError } from '../errors/errors.service';
import { UserType } from '../types';
import { hashPassword } from '../utils/auth.utils';
import { GetPaginatorReturnType, getPaginator } from '../utils/getPaginator';
import { GetUsersSchemaType, UpdateUserSchemaType } from './user.schema';

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

  if (payload.searchString) {
    andConditions.push(
      or(
        ilike(users.firstName, `%${payload.searchString}%`),
        ilike(users.lastName, `%${payload.searchString}%`),
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

  andConditions.push(inArray(users.role, ['DEFAULT_USER', 'VENDOR']));

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

export const updateUser = async (
  payload: UpdateUserSchemaType,
  userId: number,
): Promise<UserType> => {
  const user = await db
    .update(users)
    .set({ ...payload })
    .where(eq(users.id, userId))
    .returning()
    .execute();

  return user[0];
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
  superAdmin: InferSelectModel<typeof users>;
};

export const seedUsers = async (): Promise<SeedUsersReturn> => {
  await db.delete(users).execute();

  const password = 'Pa$$w0rd!';
  // Super Admin
  const superAdmin = await createUser({
    email: 'zim-admin@mailinator.com',
    firstName: 'Zim',
    lastName: 'Super Admin',
    password: password,
    isActive: true,
    role: 'SUPER_ADMIN',
    phoneNo: '123456789',
    phoneCountryCode: '+1',
    dob: '1999-01-01',
  });

  return { superAdmin };
};
