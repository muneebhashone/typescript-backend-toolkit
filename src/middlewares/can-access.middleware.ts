import {
  PermissionsType,
  RoleType,
  permissionEnums,
  rolesEnums,
} from '../drizzle/enums';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../utils/auth.utils';
import { db } from '../drizzle/db';
import { InferSelectModel, eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';
import { errorResponse } from '../utils/api.utils';
import { StatusCodes } from 'http-status-codes';

export type CanAccessByType = 'roles' | 'permissions';

export type CanAccessOptions = {
  roles: RoleType | '*';
  permissions: PermissionsType | '*';
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
        : permissionEnums
      : access;

    if (by === 'roles' && accessorsToScanFor) {
      can = (accessorsToScanFor as RoleType[]).includes(currentUser.role);
    }

    if (by === 'permissions' && accessorsToScanFor) {
      can = (accessorsToScanFor as PermissionsType[]).every((permission) => {
        if (
          'permissions' in currentUser &&
          Array.isArray(currentUser.permissions) &&
          currentUser.permissions.length
        ) {
          return currentUser.permissions?.includes(permission);
        }
        return false;
      });
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

    if (!can && by === 'permissions') {
      return errorResponse(
        res,
        "User doesn't have sufficient permissions to perform this action",
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
