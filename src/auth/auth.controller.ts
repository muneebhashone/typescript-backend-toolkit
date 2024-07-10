import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  ConflictError,
  InvalidCredentialseError,
  NotFoundError,
} from '../errors/errors.service';
import { errorResponse, successResponse } from '../utils/api.utils';
import { JwtPayload, signToken } from '../utils/auth.utils';
import { AUTH_COOKIE_KEY, COOKIE_CONFIG } from './auth.constants';
import {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  LoginUserByEmailSchemaType,
  LoginUserByPhoneAndPasswordSchemaType,
  LoginUserByPhoneSchemaType,
  RegisterHostByPhoneSchemaType,
  RegisterUserByEmailSchemaType,
  ResetPasswordSchemaType,
  SetPasswordSchemaType,
  ValidateLoginOtpSchemaType,
  VerifyOtpSchemaType,
} from './auth.schema';
import {
  changePassword,
  forgetPassword,
  loginUserByEmail,
  loginUserByPhone,
  loginUserByPhoneAndPassword,
  registerHostByPhone,
  registerUserByEmail,
  resetPassword,
  setPassword,
  validateLoginOtp,
  verifyOtp,
} from './auth.service';

export const handleSetPassword = async (
  req: Request<never, never, SetPasswordSchemaType>,
  res: Response,
) => {
  try {
    await setPassword(req.body);

    return successResponse(res, 'Password successfully set');
  } catch (err) {
    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleResetPassword = async (
  req: Request<never, never, ResetPasswordSchemaType>,
  res: Response,
) => {
  try {
    await resetPassword(req.body);

    return successResponse(res, 'Password successfully reset');
  } catch (err) {
    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleForgetPassword = async (
  req: Request<never, never, ForgetPasswordSchemaType>,
  res: Response,
) => {
  try {
    const user = await forgetPassword(req.body);

    return successResponse(res, 'Code has been sent', { userId: user.id });
  } catch (err) {
    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleChangePassword = async (
  req: Request<never, never, ChangePasswordSchemaType>,
  res: Response,
) => {
  try {
    await changePassword(Number((req.user as JwtPayload).sub), req.body);

    return successResponse(res, 'Password successfully changed');
  } catch (err) {
    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleVerifyOtp = async (
  req: Request<never, never, VerifyOtpSchemaType>,
  res: Response,
) => {
  try {
    const user = await verifyOtp(req.body);

    const token = await signToken({
      phoneNo: user?.phoneNo,
      email: user?.email,
      role: user.role,
      sub: String(user.id),
    });

    res.cookie(AUTH_COOKIE_KEY, token, COOKIE_CONFIG);

    res.json({ accessToken: token });
  } catch (err) {
    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleRegisterHost = async (
  req: Request<never, never, RegisterHostByPhoneSchemaType>,
  res: Response,
) => {
  try {
    const { user, otpSendTo } = await registerHostByPhone(req.body);

    return successResponse(
      res,
      `Please check your ${otpSendTo.join(' or ')}, OTP has been sent`,
      {
        userId: user.id,
      },
    );
  } catch (err) {
    if (err instanceof ConflictError) {
      return errorResponse(res, err.message, StatusCodes.CONFLICT);
    }

    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleRegisterUser = async (
  req: Request<never, never, RegisterUserByEmailSchemaType>,
  res: Response,
) => {
  try {
    const { otpSendTo, user } = await registerUserByEmail(req.body);

    return successResponse(
      res,
      `Please check your ${otpSendTo.join(' or ')}, OTP has been sent`,
      {
        userId: user.id,
      },
    );
  } catch (err) {
    if (err instanceof ConflictError) {
      return errorResponse(res, err.message, StatusCodes.CONFLICT);
    }

    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleLogout = async (_: Request, res: Response) => {
  try {
    res.cookie(AUTH_COOKIE_KEY, undefined, COOKIE_CONFIG);

    return res.send('Logged out');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleLoginByEmail = async (
  req: Request<never, never, LoginUserByEmailSchemaType>,
  res: Response,
) => {
  try {
    const token = await loginUserByEmail(req.body);

    res.cookie(AUTH_COOKIE_KEY, token, COOKIE_CONFIG);

    return res.json({ token: token });
  } catch (err) {
    if (err instanceof InvalidCredentialseError) {
      return errorResponse(res, err.message, StatusCodes.BAD_REQUEST);
    }

    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleLoginByPhoneAndPassword = async (
  req: Request<never, never, LoginUserByPhoneAndPasswordSchemaType>,
  res: Response,
) => {
  try {
    const token = await loginUserByPhoneAndPassword(req.body);

    res.json({ accessToken: token });
  } catch (err) {
    if (err instanceof InvalidCredentialseError) {
      return errorResponse(res, err.message, StatusCodes.BAD_REQUEST);
    }

    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleLoginByPhone = async (
  req: Request<never, never, LoginUserByPhoneSchemaType>,
  res: Response,
) => {
  try {
    const user = await loginUserByPhone(req.body);

    const phone = `*******${user.phoneNo?.slice(-3)}`;

    return successResponse(res, `Code has been sent to ${phone}`, {
      userId: user.id,
    });
  } catch (err) {
    if (err instanceof InvalidCredentialseError) {
      return errorResponse(res, err.message, StatusCodes.BAD_REQUEST);
    }

    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleValidateLoginCode = async (
  req: Request<never, never, ValidateLoginOtpSchemaType>,
  res: Response,
) => {
  try {
    const token = await validateLoginOtp(req.body);

    res.cookie(AUTH_COOKIE_KEY, token, COOKIE_CONFIG);

    return res.json({ token: token });
  } catch (err) {
    if (err instanceof InvalidCredentialseError) {
      return errorResponse(res, err.message, StatusCodes.BAD_REQUEST);
    }

    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleGetCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    return res.json({ user });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return errorResponse(res, err.message, StatusCodes.NOT_FOUND);
    }

    return errorResponse(
      res,
      'Not allowed to access this route',
      StatusCodes.UNAUTHORIZED,
    );
  }
};
