import { ConflictError } from '../errors/errors.service';
import User, { IUser, IUserDocument } from './user.model';
import { UserType } from '../types';
import { hashPassword } from '../utils/auth.utils';
import { createUser } from './user.services';

export type SeedUsersReturn = {
  superAdmin: IUser;
};
export const seedUsers = async (): Promise<SeedUsersReturn> => {
  const superAdmin = await createUser({
    email: 'john5.doe@example.com',
    avatar: 'https://example.com/avatars/johndoe.jpg',
    firstName: 'John',
    lastName: 'Doe',
    role: 'SUPER_ADMIN',
    dob: new Date(),
    phoneNo: '+1234567890',
    isActive: true,
    otp: null,
    password: 'Pa$$w0rd!',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    streetAddress: '123 Tech Street',
    postalCode: '94105',
  });

  return { superAdmin };
};
export const seedManyUsers = async (
  users: (UserType & { password: string })[],
  checkExist: boolean = true,
): Promise<UserType[]> => {
  await User.deleteMany({});
  const updatedUsers: (UserType & { password: string })[] = [];

  for (const payload of users) {
    if (checkExist) {
      let isUserExist: IUserDocument | null = null;

      if (payload.email) {
        isUserExist = await User.findOne({ email: payload.email });

        if (isUserExist) {
          throw new ConflictError(
            `User ${payload.email} already exists with the same email address`,
          );
        }
      } else if (payload.phoneNo) {
        isUserExist = await User.findOne({ phoneNo: payload.phoneNo });

        if (isUserExist) {
          throw new ConflictError(
            `User ${payload.phoneNo} already exists with the same phone number`,
          );
        }
      }
    }

    if (!payload.password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await hashPassword(payload.password);

    updatedUsers.push({ ...payload, password: hashedPassword, otp: null });
  }
  const createdUsers = await User.insertMany(updatedUsers);

  return createdUsers.map((user) => ({
    ...user.toObject(),
    _id: user._id.toString(),
    password: '', // Ensure password is not returned
    otp: '',
  }));
};

export const USERS_TO_SEED: UserType[] = [
  {
    email: 'john.superadmin@example.com',
    avatar:
      'https://media.licdn.com/dms/image/D4D03AQEcQE3lsSkVzA/profile-displayphoto-shrink_400_400/0/1700310963378?e=2147483647&v=beta&t=IhjL4FDUgzDQ3vtFoSHumzsVT_8onFFpQk95ZZJqUF4',
    firstName: 'John',
    lastName: 'SuperAdmin',
    role: 'SUPER_ADMIN',
    dob: new Date(),
    phoneNo: '+1234567890',
    isActive: true,
    otp: null,
    password: 'Pa$$w0rd!',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    streetAddress: '123 Tech Street',
    postalCode: '94105',
  },
  {
    email: 'john.defaultuser@example.com',
    avatar:
      'https://media.licdn.com/dms/image/C4D03AQEeEyYzNtDq7g/profile-displayphoto-shrink_400_400/0/1524234561685?e=2147483647&v=beta&t=CJY6IY9Bsqc2kiES7HZmnMo1_uf11zHc9DQ1tyk7R7Y',
    firstName: 'John',
    lastName: 'DefaultUser',
    role: 'DEFAULT_USER',
    dob: new Date(),
    phoneNo: '+1234567891',
    tempPhoneNo: '+1987654322',
    isActive: true,
    otp: null,
    password: 'Pa$$w0rd!',
    country: 'United States',
    state: 'California',
    city: 'Los Angeles',
    streetAddress: '456 Hollywood Blvd',
    postalCode: '90001',
  },
];
