import { FilterQuery } from 'mongoose';
import { ConflictError } from '../errors/errors.service';
import { SendOtpEmailQueue } from '../queues/email.queue';
import { UserType } from '../types';
import { hashPassword } from '../utils/auth.utils';
import { generateRandomNumbers } from '../utils/common.utils';
import { getPaginator } from '../utils/getPaginator';
import User, { IUserDocument } from './user.model';
import {
  GetUsersSchemaType,
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

export const getUserById = async (userId: UserIdSchemaType) => {
  const { id } = userId;
  const user = await User.findOne({
    _id: id,
  }).select('+otp');

  return user?.toObject();
};

export const clearUsers = async () => {
  await User.deleteMany();
};

export const deleteUser = async (userId: UserIdSchemaType) => {
  const id = userId;
  const user = await User.findById({ _id: id });

  if (user?.role === 'SUPER_ADMIN') {
    throw new Error("SUPER_ADMIN can't be deleted");
  }

  await User.deleteOne({
    _id: id,
  });
};

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
    conditions.role = { $in: ['DEFAULT_USER'] };
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

  const isPhoneNoAlreadyInUse = await User.findOne({
    _id: id,
    phoneNo: payload.phoneNo,
  });

  if (isPhoneNoAlreadyInUse) {
    throw new Error('Phone No. already in use');
  }

  const user = await User.findOne({ _id: id });

  if (!user) {
    throw new Error("User doesn't exist");
  }

  if (user.phoneNo === payload.phoneNo) {
    return;
  }

  const otpCode = generateRandomNumbers(4);

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

  const isEmailAlreadyInUse = await User.findOne({
    email: payload.email,
    _id: { $ne: _id },
  });

  if (isEmailAlreadyInUse) {
    throw new Error('Email already in use');
  }

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

export const updateUser = async (
  payload: Partial<UserType>,
  userId: UserIdSchemaType,
) => {
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
      isUserExist = await User.findOne({ email: payload.email });

      if (isUserExist) {
        throw new ConflictError('User already exists with same email address');
      }
    } else if (payload.phoneNo) {
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

  const createdUser = await User.create({
    ...payload,
    password: hashedPassword,
  });
  return { ...createdUser.toObject(), password: '', otp: null };
};
