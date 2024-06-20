import { InferSelectModel, eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../drizzle/db';
import { RoleType, rolesEnums } from '../drizzle/enums';
import { users } from '../drizzle/schema';
import { errorResponse } from '../utils/api.utils';
import { JwtPayload } from '../utils/auth.utils';

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
    if (!req.user) {
      return errorResponse(
        res,
        "token isn't attached or expired",
        StatusCodes.UNAUTHORIZED,
      );
    }

    const currentUser = (await db.query.users.findFirst({
      where: eq(users.id, Number((req.user as JwtPayload).sub)),
    })) as InferSelectModel<typeof users>;

    if (!currentUser) {
      return errorResponse(res, 'Login again', StatusCodes.UNAUTHORIZED);
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
