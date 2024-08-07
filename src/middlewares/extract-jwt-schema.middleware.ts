import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verifyToken } from '../utils/auth.utils';

export const extractJwt = async (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies?.['accessToken'] ??
      req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return next();
    }

    const decode = await verifyToken<JwtPayload>(token);

    req.user = decode;
    return next();
  } catch {
    return next();
  }
};
