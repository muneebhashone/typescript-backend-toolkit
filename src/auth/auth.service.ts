import { ROLE_ENUM, RoleType, SOCIAL_ACCOUNT_ENUM } from '../enums';
import {
  InvalidCredentialseError,
  NotFoundError,
} from '../errors/errors.service';
import { SendOtpEmailQueue } from '../queues/email.queue';
import { GoogleCallbackQuery, UserType } from '../types';
import User from '../user/user.model';
import { createUser } from '../user/user.services';
import {
  compareHash,
  fetchGoogleTokens,
  getUserInfo,
  hashPassword,
  JwtPayload,
  signToken,
} from '../utils/auth.utils';
import { generateRandomNumbers } from '../utils/common.utils';
import {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  LoginUserByEmailSchemaType,
  LoginUserByPhoneAndPasswordSchemaType,
  LoginUserByPhoneSchemaType,
  RegisterUserByEmailSchemaType,
  ResetPasswordSchemaType,
  SetPasswordSchemaType,
  ValidateLoginOtpSchemaType,
  VerifyOtpSchemaType,
} from './auth.schema';

export const checkEmailExist = async () => {};

export const setPassword = async (payload: SetPasswordSchemaType) => {
  const user = User.findOne({
    _id: payload.userId,
    setPasswordCode: payload.code,
  });
  if (!user) {
    throw new Error('token is not valid or expired, please try again');
  }

  if (payload.confirmPassword !== payload.password) {
    throw new Error('Password and confirm password must be same');
  }

  const hashedPassword = await hashPassword(payload.password);

  await User.updateOne(
    {
      _id: payload.userId,
    },
    { $set: { password: hashedPassword } },
  );
};

export const resetPassword = async (payload: ResetPasswordSchemaType) => {
  const user = User.findOne({
    _id: payload.userId,
    passwordResetCode: payload.code,
  });
  if (!user) {
    throw new Error('token is not valid or expired, please try again');
  }

  if (payload.confirmPassword !== payload.password) {
    throw new Error('Password and confirm password must be same');
  }

  const hashedPassword = await hashPassword(payload.password);

  await User.updateOne(
    {
      _id: payload.userId,
    },
    {
      $set: {
        password: hashedPassword,
        passwordResetCode: null,
      },
    },
  );
};

export const prepareSetPasswordAndSendEmail = async (
  user: UserType,
): Promise<void> => {
  const code = generateRandomNumbers(4);

  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        setPasswordCode: code,
      },
    },
  );
};

export const forgetPassword = async (
  payload: ForgetPasswordSchemaType,
): Promise<UserType> => {
  const user = await User.findOne({
    phoneNo: payload.phoneNo,
  });
  if (!user) {
    throw new Error("user doesn't exists");
  }

  const code = generateRandomNumbers(4);

  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: { setPasswordCode: code },
    },
  );

  return user.toObject();
};

export const verifyOtp = async (payload: VerifyOtpSchemaType) => {
  const user = await User.findOne({
    _id: payload.userId,
  }).select('+otp');

  if (!user) {
    throw new Error("User isn't registered");
  }

  if (payload.type) {
    if (payload.type === 'RESET_PASSWORD') {
      if (user.passwordResetCode !== payload.otp) {
        throw new Error('Invalid password reset code');
      }
    }

    if (payload.type === 'DEFAULT') {
      if (user.otp !== payload.otp) {
        throw new Error('Invalid OTP');
      }

      await User.updateOne({ _id: user._id }, { $set: { otp: null } });
    }
  } else {
    if (user.otp !== payload.otp) {
      throw new Error('Invalid OTP');
    }

    await User.updateOne({ _id: user._id }, { $set: { otp: null } });
  }

  return user;
};

export const changePassword = async (
  userId: string,
  payload: ChangePasswordSchemaType,
): Promise<void> => {
  const user = await User.findOne({
    _id: userId,
  }).select('+password');

  if (!user || !user.password) {
    throw new NotFoundError('User is not found');
  }

  const isCurrentPassowordCorrect = await compareHash(
    user.password,
    payload.currentPassword,
  );

  if (!isCurrentPassowordCorrect) {
    throw new Error('current password is not valid');
  }

  const hashedPassword = await hashPassword(payload.newPassword);

  await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
};

export const registerUserByEmail = async (
  payload: RegisterUserByEmailSchemaType,
): Promise<{ user: UserType; otpSendTo: string[] }> => {
  const userExistByEmail = await User.findOne({
    email: payload.email,
  });

  if (userExistByEmail && userExistByEmail.otp === null) {
    throw new Error('Account already exist with same email address');
  }

  const userExistByPhone = await User.findOne({
    phoneNo: payload.phoneNo,
  });

  if (userExistByPhone && userExistByPhone.otp === null) {
    throw new Error('Account already exist with same phone no.');
  }

  const otp = generateRandomNumbers(4);

  const otpSendTo = [];

  // It means user is registered already but didn't perform otp verification
  if (userExistByEmail) {
    await User.deleteOne({ _id: userExistByEmail._id });
  }

  if (userExistByPhone) {
    await User.deleteOne({ _id: userExistByPhone._id });
  }

  const user = await createUser(
    {
      email: payload.email,
      firstName: payload.email,
      lastName: payload.lastName,
      password: payload.password,
      dob: new Date(payload.dob),
      phoneNo: payload.phoneNo,
      role: 'DEFAULT_USER',
      isActive: true,
      otp: otp,
    },
    false,
  );

  await SendOtpEmailQueue.add(String(otp), {
    email: payload.email,
    otpCode: otp,
    userName: `${payload.firstName} ${payload.lastName}`,
  });

  otpSendTo.push('email');

  if (user.phoneNo) {
    otpSendTo.push('phone');
  }

  return { user, otpSendTo };
};

export const canUserAuthorize = (user: UserType) => {
  if (!user.isActive) {
    throw new Error('Your account is disabled');
  }

  if (user.otp !== null) {
    throw new Error('Your account is not verified');
  }
};

export const loginUserByEmail = async (
  payload: LoginUserByEmailSchemaType,
): Promise<string> => {
  const user = await User.findOne({ email: payload.email }).select(
    '+password +otp',
  );

  if (!user || !(await compareHash(String(user.password), payload.password))) {
    throw new InvalidCredentialseError('Invalid email or password');
  }

  canUserAuthorize(user.toObject());

  const jwtPayload: JwtPayload = {
    sub: String(user.id),
    email: user?.email,
    phoneNo: user?.phoneNo,
    role: String(user.role) as RoleType,
  };

  const token = await signToken(jwtPayload);

  return token;
};

export const loginUserByPhoneAndPassword = async (
  payload: LoginUserByPhoneAndPasswordSchemaType,
): Promise<string> => {
  const user = await User.findOne({
    phoneNo: payload.phoneNo,
  }).select('+password  +otp');

  if (!user || !(await compareHash(String(user.password), payload.password))) {
    throw new InvalidCredentialseError('Invalid phone no. or password');
  }

  await canUserAuthorize(user.toObject());

  const jwtPayload: JwtPayload = {
    sub: String(user.id),
    email: user?.email,
    phoneNo: user?.phoneNo,
    role: String(user.role) as RoleType,
  };

  const token = await signToken(jwtPayload);

  return token;
};

export const loginUserByPhone = async (
  payload: LoginUserByPhoneSchemaType,
): Promise<UserType> => {
  const user = await User.findOne({
    phoneNo: payload.phoneNo,
  }).select('+otp');

  if (!user) {
    throw new Error('User not found');
  }

  await canUserAuthorize(user.toObject());

  const loginOtp = generateRandomNumbers(4);

  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: { loginOtp },
    },
  );
  return user.toObject();
};

export const validateLoginOtp = async (payload: ValidateLoginOtpSchemaType) => {
  const user = await User.findById({
    _id: payload.userId,
  }).select('+loginOtp +password +otp');

  if (!user) {
    throw new Error('User not found');
  }

  if ('loginOtp' in user && user.loginOtp !== payload.code) {
    throw new Error('Code is invalid');
  }

  canUserAuthorize(user.toObject());

  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: { otp: null },
    },
  );
  const jwtPayload: JwtPayload = {
    sub: String(user.id),
    email: user?.email,
    phoneNo: user?.phoneNo,
    role: String(user.role) as RoleType,
  };

  const token = await signToken(jwtPayload);

  return token;
};
export const googleLogin = async (
  payload: GoogleCallbackQuery,
): Promise<UserType> => {
  const { code, error } = payload;
  if (error) {
    throw new Error(error);
  }

  if (!code) {
    throw new Error('Code Not Provided');
  }
  const tokenResponse = await fetchGoogleTokens({ code });

  const { access_token, refresh_token, expires_in } = tokenResponse;

  const userInfoResponse = await getUserInfo(access_token);

  const { id, email, name, picture } = userInfoResponse;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return await createUser({
      email,
      firstName: name,
      avatar: picture,
      role: ROLE_ENUM.DEFAULT_USER,
      isActive: true,
      password: generateRandomNumbers(4),
      socialAccount: [
        {
          refreshToken: refresh_token,
          tokenExpiry: new Date(Date.now() + expires_in * 1000),
          accountType: SOCIAL_ACCOUNT_ENUM.GOOGLE,
          accessToken: access_token,
          accountID: id,
        },
      ],
    });
  } else {
    existingUser.socialAccount = [
      {
        refreshToken: refresh_token,
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        accountType: SOCIAL_ACCOUNT_ENUM.GOOGLE,
        accessToken: access_token,
        accountID: id,
      },
    ];
    await existingUser.save();
  }

  return existingUser.toObject();
};
