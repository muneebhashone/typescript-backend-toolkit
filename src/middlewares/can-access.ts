import type { NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { RoleType } from '../enums';
import { errorResponse } from '../utils/api.utils';
import type { JwtPayload } from '../utils/auth.utils';
import type { RequestAny, ResponseAny } from '../openapi/magic-router';

export type CanAccessByType = 'roles';

export type CanAccessOptions = {
  roles: RoleType | '*';
};

export const canAccess =
  <T extends CanAccessByType>(by?: T, access?: CanAccessOptions[T][]) =>
  async (req: RequestAny, res: ResponseAny, next: NextFunction) => {
    try {
      const requestUser = req?.user as JwtPayload | undefined;

      if (!requestUser) {
        return errorResponse(
          res,
          "token isn't attached or expired",
          StatusCodes.UNAUTHORIZED,
        );
      }

      let can = false;

      const accessorsToScanFor = access as (RoleType | '*')[] | undefined;

      if (by === 'roles' && accessorsToScanFor && accessorsToScanFor.length) {
        if ((accessorsToScanFor as (RoleType | '*')[]).includes('*')) {
          can = true;
        } else {
          can = (accessorsToScanFor as RoleType[]).includes(requestUser.role);
        }
      }

      if (!accessorsToScanFor && !by) {
        can = true; // Authenticated since JWT is present
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
    } catch (err) {
      return errorResponse(
        res,
        (err as Error).message,
        StatusCodes.UNAUTHORIZED,
        access,
      );
    }

    next();
  };
