import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  ConflictError,
  InvalidCredentialseError,
  NotFoundError,
} from '../errors/errors.service';
import { createUser, getUserById } from '../user/user.services';
import { errorResponse, successResponse } from '../utils/api.utils';
import { JwtPayload } from '../utils/auth.utils';
import { AUTH_COOKIE_KEY, COOKIE_CONFIG } from './auth.constants';
import {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  LoginUserSchemaType,
  RegisterCompanySchemaType,
  RegisterUserSchemaType,
  ResetPasswordSchemaType,
  SetPasswordSchemaType,
} from './auth.schema';
import {
  changePassword,
  forgetPassword,
  loginUser,
  registerCompany,
  resetPassword,
  setPassword,
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
    await forgetPassword(req.body);

    return successResponse(res, 'Email has been sent, Please check your email');
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

export const handleRegisterUser = async (
  req: Request<never, never, RegisterUserSchemaType>,
  res: Response,
) => {
  try {
    await createUser({
      ...req.body,
      permissions: [
        'VIEW_DASHBOARD',
        'VIEW_SHIPMENT',
        'VIEW_USER',
        'EDIT_SHIPMENT',
        'EDIT_USER',
        'DELETE_SHIPMENT',
        'DELETE_USER',
      ],
      role: 'CLIENT_SUPER_USER',
      status: 'REQUESTED',
    });

    return successResponse(
      res,
      'Account successfully created, pending approval',
    );
  } catch (err) {
    if (err instanceof ConflictError) {
      return errorResponse(res, err.message, StatusCodes.CONFLICT);
    }

    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleRegisterCompany = async (
  req: Request<never, never, RegisterCompanySchemaType>,
  res: Response,
) => {
  try {
    await registerCompany(req.body);

    return successResponse(
      res,
      'Account successfully created, pending approval',
    );
  } catch (err) {
    if (err instanceof ConflictError) {
      return errorResponse(res, err.message, StatusCodes.CONFLICT);
    }

    return errorResponse(res, (err as Error).message, StatusCodes.BAD_REQUEST);
  }
};

export const handleLogout = async (
  _: Request<never, never, LoginUserSchemaType>,
  res: Response,
) => {
  try {
    res.cookie(AUTH_COOKIE_KEY, undefined, COOKIE_CONFIG);

    return res.send('Logged out');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleLogin = async (
  req: Request<never, never, LoginUserSchemaType>,
  res: Response,
) => {
  try {
    const token = await loginUser(req.body);

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
    const user = await getUserById(Number((req.user as JwtPayload).sub));
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
