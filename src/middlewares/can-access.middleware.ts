import { InferSelectModel, eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../drizzle/db';
import { RoleType, rolesEnums } from '../drizzle/enums';
import { users } from '../drizzle/schema';
import { errorResponse } from '../utils/api.utils';
import { JwtPayload } from '../utils/auth.utils';
import { getUserById } from '../user/user.services';

export type CanAccessByType = 'roles';

export type CanAccessOptions = {
  roles: RoleType | '*';
};

export const canAccess =
  <T extends CanAccessByType>(by?: T, access?: CanAccessOptions[T][]) =>
  async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction,
  ) => {
    const requestUser = req?.user as JwtPayload;

    if (!requestUser) {
      return errorResponse(
        res,
        "token isn't attached or expired",
        StatusCodes.UNAUTHORIZED,
      );
    }

    const currentUser = await getUserById(
      Number(requestUser.sub),
      requestUser.role,
    );

    if (!currentUser) {
      return errorResponse(res, 'Login again', StatusCodes.UNAUTHORIZED);
    }

    if (!currentUser.isActive) {
      return errorResponse(
        res,
        'Your account has been disabled',
        StatusCodes.UNAUTHORIZED,
      );
    }

    let can = false;

    const accessorsToScanFor = access?.includes('*')
      ? by === 'roles'
        ? rolesEnums
        : access
      : [];

    if (by === 'roles' && accessorsToScanFor) {
      can = (accessorsToScanFor as RoleType[]).includes(currentUser.role);
    }

    if (!accessorsToScanFor) {
      can = Boolean((req.user as JwtPayload)?.email);
    }

    if (!can && by === 'roles') {
      return errorResponse(
        res,
        'User is not authorized to perform this action',
        StatusCodes.UNAUTHORIZED,
        { [`${by}_required`]: access },
      );
    }

    if (!can) {
      return errorResponse(
        res,
        'User is not authenticated',
        StatusCodes.UNAUTHORIZED,
        access,
      );
    }

    if (currentUser) {
      req['user'] = { ...currentUser, sub: currentUser.id };
    }

    next();
  };
