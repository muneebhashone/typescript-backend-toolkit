import { sign, verify } from 'jsonwebtoken';
import config from '../config/env';
import type { RoleType } from '../enums';
import logger from '@/plugins/logger';

export type JwtPayload = {
  sub: string;
  email?: string | null;
  phoneNo?: string | null;
  username: string;
  role: RoleType;
  sid?: string;
};

export type PasswordResetTokenPayload = {
  email: string;
  userId: string;
};

export type SetPasswordTokenPayload = {
  email: string;
  userId: string;
};

/**
 * Sign a JWT token with the given payload
 * @param payload - JWT payload
 * @returns Signed JWT token
 * @throws Error if JWT_SECRET is not configured
 */
export const signToken = async (payload: JwtPayload): Promise<string> => {
  if (!config.JWT_SECRET || !config.JWT_EXPIRES_IN) {
    throw new Error('JWT configuration is not available. Please enable JWT authentication.');
  }
  return sign(payload, String(config.JWT_SECRET), {
    expiresIn: Number(config.JWT_EXPIRES_IN),
  });
};

/**
 * Sign a password reset token
 * @param payload - Password reset token payload
 * @returns Signed password reset token
 * @throws Error if JWT_SECRET or PASSWORD_RESET_TOKEN_EXPIRES_IN is not configured
 */
export const signPasswordResetToken = async (
  payload: PasswordResetTokenPayload,
): Promise<string> => {
  if (!config.JWT_SECRET || !config.PASSWORD_RESET_TOKEN_EXPIRES_IN) {
    throw new Error('JWT or session configuration is not available. Please enable authentication with sessions.');
  }
  return sign(payload, String(config.JWT_SECRET), {
    expiresIn: config.PASSWORD_RESET_TOKEN_EXPIRES_IN,
  });
};

/**
 * Sign a set password token
 * @param payload - Set password token payload
 * @returns Signed set password token
 * @throws Error if JWT_SECRET or SET_PASSWORD_TOKEN_EXPIRES_IN is not configured
 */
export const signSetPasswordToken = async (
  payload: SetPasswordTokenPayload,
): Promise<string> => {
  if (!config.JWT_SECRET || !config.SET_PASSWORD_TOKEN_EXPIRES_IN) {
    throw new Error('JWT or session configuration is not available. Please enable authentication with sessions.');
  }
  return sign(payload, String(config.JWT_SECRET), {
    expiresIn: config.SET_PASSWORD_TOKEN_EXPIRES_IN,
  });
};

/**
 * Verify a JWT token and return the decoded payload
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired or JWT_SECRET is not configured
 */
export const verifyToken = async <
  T extends JwtPayload | PasswordResetTokenPayload | SetPasswordTokenPayload,
>(
  token: string,
): Promise<T> => {
  if (!config.JWT_SECRET) {
    throw new Error('JWT configuration is not available. Please enable JWT authentication.');
  }
  try {
    return verify(token, String(config.JWT_SECRET)) as T;
  } catch (err) {
    if (err instanceof Error) {
      logger.error({ error: err.message }, 'verifyToken failed');
      throw err;
    }
    logger.error({ err }, 'verifyToken failed with unknown error');
    throw new Error('Token verification failed');
  }
};
