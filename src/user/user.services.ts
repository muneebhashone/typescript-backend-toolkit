import { FilterQuery } from 'mongoose';
import { RoleType } from '../enums';
import { ConflictError } from '../errors/errors.service';
import User, { IUser, IUserDocument } from '../models/users';
import { SendOtpEmailQueue } from '../queues/email.queue';
import { UserType } from '../types';
import { hashPassword } from '../utils/auth.utils';
import { generateRandomNumbers } from '../utils/common.utils';
import { getPaginator } from '../utils/getPaginator';
import {
  GetUsersSchemaType,
  UpdateHostSchemaType,
  UpdateUserEmailSchemaType,
  UpdateUserPhoneSchemaType,
  UserIdSchemaType,
  VerifyUpdateOtpSchemaType,
} from './user.schema';
export const activeToggle = async (userId: UserIdSchemaType) => {
  const { id } = userId;
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new Error('User not found');
  }
  const toggleStatus = !user.isActive;

  await User.findByIdAndUpdate(
    { _id: id },
    { $set: { isActive: toggleStatus } },
    { new: true },
  );

  return toggleStatus;
};

export const getUserById = async (
  userId: UserIdSchemaType,
  role: RoleType = 'DEFAULT_USER',
) => {
  const { id } = userId;
  const user = await User.findOne({
    _id: id,
  }).select('+otp');
  console.log({ user });
  if (role === 'VENDOR') {
    await user?.populate('business');
  }
  return user?.toObject();
};

// export type GetUsersReturnType = {
//   results: InferSelectModel<typeof users>[];
//   paginatorInfo: GetPaginatorReturnType;
// };

export const clearUsers = async () => {
  await User.deleteMany();
};

export const deleteUser = async (userId: UserIdSchemaType) => {
  const id = userId;
  const user = await User.findById({ _id: id });

  if (user?.role === 'SUPER_ADMIN') {
    throw new Error("SUPER_ADMIN can't be deleted");
  }

  // await db.delete(users).where(eq(users.id, userId)).execute();
  await User.deleteOne({
    _id: id,
  });
};

// export const deleteBulkUsers = async (userIds: number[]) => {
//   const manyUsers = await User.find({
//     _id: { $in: userIds },
//   });

//   const isThereAnySuperAdmin = manyUsers.some(
//     (singleUser) => singleUser.role === 'SUPER_ADMIN',
//   );

//   if (isThereAnySuperAdmin) {
//     throw new Error("SUPER_ADMIN can't be deleted");
//   }

//   await User.deleteMany({ _id: { $in: userIds } });
// };

export const getUsers = async (
  userId: UserIdSchemaType,
  payload: GetUsersSchemaType,
) => {
  const { id } = userId;
  const currentUser = await User.findById({ _id: id });
  if (!currentUser) {
    throw new Error('User must be logged in');
  }

  const conditions: FilterQuery<IUserDocument> = {};

  if (payload.filterByActive !== undefined) {
    conditions.isActive = payload.filterByActive;
  }
  if (payload.searchString) {
    conditions.$or = [
      { firstName: { $regex: payload.searchString, $options: 'i' } },
      { lastName: { $regex: payload.searchString, $options: 'i' } },
      { email: { $regex: payload.searchString, $options: 'i' } },
    ];
  }

  if (payload.filterByRole) {
    conditions.role = payload.filterByRole;
  } else {
    conditions.role = { $in: ['DEFAULT_USER', 'VENDOR'] };
  }

  const totalRecords = await User.countDocuments(conditions);
  const paginatorInfo = getPaginator(
    payload.limitParam,
    payload.pageParam,
    totalRecords,
  );

  const results = await User.find(conditions)
    .limit(paginatorInfo.limit)
    .skip(paginatorInfo.skip)
    .exec();

  return {
    results,
    paginatorInfo,
  };
};

export const verifyUpdateOtp = async (
  payload: VerifyUpdateOtpSchemaType,
  userId: UserIdSchemaType,
): Promise<void> => {
  const { id } = userId;
  const userToUpdate = await User.findById({ _id: id }).select('+updateOtp');

  if (!userToUpdate) {
    throw new Error("User doesn't exist");
  }

  if (userToUpdate?.updateOtp !== payload.code) {
    throw new Error('Invalid code');
  }

  if (payload.for === 'email' && userToUpdate.tempEmail) {
    await User.updateOne(
      { _id: id },
      {
        $set: {
          email: userToUpdate.tempEmail,
          updateOtp: null,
          tempEmail: null,
        },
      },
    );
  }

  if (payload.for === 'phone' && userToUpdate.tempPhoneNo) {
    await User.updateOne(
      { _id: id },
      {
        $set: {
          phoneNo: userToUpdate.tempPhoneNo,
          updateOtp: null,
          tempPhoneNo: null,
        },
      },
    );
  }
};

export const updateUserPhone = async (
  payload: UpdateUserPhoneSchemaType,
  userId: UserIdSchemaType,
): Promise<void> => {
  const { id } = userId;
  // const isPhoneNoAlreadyInUse = await db.query.users.findFirst({
  //   where: and(eq(users.phoneNo, payload.phoneNo), ne(users.id, userId)),
  // });
  const isPhoneNoAlreadyInUse = await User.findOne({
    _id: id,
    phoneNo: payload.phoneNo,
  });

  if (isPhoneNoAlreadyInUse) {
    throw new Error('Phone No. already in use');
  }

  const user = await User.findOne({ _id: id });
  // const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) {
    throw new Error("User doesn't exist");
  }

  if (user.phoneNo === payload.phoneNo) {
    return;
  }

  const otpCode = generateRandomNumbers(4);
  // await db
  //   .update(users)
  //   .set({ tempPhoneNo: payload.phoneNo, updateOtp: otpCode })
  //   .where(eq(users.id, userId))
  //   .returning()
  //   .execute();
  await User.updateOne(
    { _id: id },
    { $set: { tempPhoneNo: payload.phoneNo, updateOtp: otpCode } },
    { new: true },
  );
};

export const updateUserEmail = async (
  payload: UpdateUserEmailSchemaType,
  userId: UserIdSchemaType,
): Promise<void> => {
  const { id: _id } = userId;
  // const isEmailAlreadyInUse = await db.query.users.findFirst({
  //   where: and(eq(users.email, payload.email), ne(users.id, userId)),
  // });
  const isEmailAlreadyInUse = await User.findOne({
    email: payload.email,
    _id: { $ne: _id },
  });

  if (isEmailAlreadyInUse) {
    throw new Error('Email already in use');
  }

  // const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const user = await User.findOne({ _id });

  if (!user) {
    throw new Error("User doesn't exist");
  }

  if (user.email === payload.email) {
    return;
  }

  const otpCode = generateRandomNumbers(4);

  const updatedUser = await User.findOneAndUpdate(
    { _id },
    { $set: { tempEmail: payload.email, updateOtp: otpCode } },
    { new: true },
  );

  if (!updatedUser) {
    throw new Error('User not found');
  }

  await SendOtpEmailQueue.add(String(updatedUser._id), {
    email: payload.email,
    otpCode: otpCode,
    userName: updatedUser.firstName ?? 'N/A',
  });
};

// export const updateUser = async (
//   payload: UpdateUserSchemaType,
//   userId: number,
// ) => {
//   // const user = await db
//   //   .update(users)
//   //   .set({ ...payload })
//   //   .where(eq(users.id, userId))
//   //   .returning()
//   //   .execute();

//   // return user?.toObject()[0];
//   const user = await User.findOneAndUpdate(
//     { _id: userId },
//     { $set: { ...payload } },
//     { new: true },
//   );
//   return user?.toObject();
// };
export const updateUser = async (
  payload: Partial<UserType>,
  userId: UserIdSchemaType,
) => {
  const { id } = userId;
  // const userObjectId = userId;

  const user = await User.findOneAndUpdate(
    { _id: id },
    { $set: { ...payload } },
    { new: true },
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user?.toObject();
};
export const updateHost = async (
  payload: UpdateHostSchemaType,
  userId: UserIdSchemaType,
) => {
  // const user = await db
  //   .update(users)
  //   .set({ ...payload })
  //   .where(eq(users.id, userId))
  //   .returning()
  //   .execute();

  // return user?.toObject()[0];
  const { id } = userId;
  const user = await User.findOneAndUpdate(
    { _id: id },
    { $set: { ...payload } },
    { new: true },
  );
  if (!user) {
    throw new Error('User not found');
  }
  return user?.toObject();
};

export const createUser = async (
  payload: UserType & { password: string },
  checkExist: boolean = true,
): Promise<UserType> => {
  if (checkExist) {
    let isUserExist: IUserDocument | null | undefined = null;

    if (payload.email) {
      // isUserExist = await db.query.users.findFirst({
      //   where: eq(users.email, payload.email),
      // });
      isUserExist = await User.findOne({ email: payload.email });

      if (isUserExist) {
        throw new ConflictError('User already exists with same email address');
      }
    } else if (payload.phoneNo) {
      // isUserExist = await db.query.users.findFirst({
      //   where: eq(users.email, payload.phoneNo),
      // });
      isUserExist = await User.findOne({ phoneNo: payload.phoneNo });

      if (isUserExist) {
        throw new ConflictError('User already exists with same phone number');
      }
    }
  }

  if (!payload.password) {
    throw new Error('Password is required');
  }

  const hashedPassword = await hashPassword(payload.password);

  // const createdUser = (
  //   await db
  //     .insert(users)
  //     .values({
  //       ...payload,
  //       password: hashedPassword,
  //     })
  //     .returning()
  //     .execute()
  // )[0];
  const createdUser = await User.create({
    ...payload,
    password: hashedPassword,
  });
  return { ...createdUser.toObject(), password: '', otp: '' };
};

export type SeedUsersReturn = {
  superAdmin: IUser;
};

export const seedUsers = async (): Promise<SeedUsersReturn> => {
  // await User.deleteMany({});

  // const password = 'Pa$$w0rd!';
  const superAdmin = await createUser({
    email: 'john5.doe@example.com',
    tempEmail: 'john4.temp@example.com',
    avatar: 'https://example.com/avatars/johndoe.jpg',
    firstName: 'John',
    lastName: 'Doe',
    role: 'SUPER_ADMIN',
    dob: new Date(),
    phoneNo: '+1234567890',
    tempPhoneNo: '+1987654321',
    isActive: true,
    otp: null,
    password: 'Pa$$w0rd!',
    // passwordResetCode: 'reset123',
    // setPasswordCode: 'set456',
    // _id: '507f1f77bcf86cd799439011',
    // otp: '123456',
    // loginOtp: '654321',
    // updateOtp: '789012',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    streetAddress: '123 Tech Street',
    business: '507f1f77bcf86cd799439011',
    postalCode: '94105',
    // updatedAt: new Date(),
    // createdAt: new Date(),
    accountName: 'John Doe',
    bankName: 'TechBank',
    accountNumber: '1234567890',
    interest: '507f1f77bcf86cd799439011',
  });

  return { superAdmin };
};
