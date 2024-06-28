import argon2 from 'argon2';
import { JsonWebTokenError, sign, verify } from 'jsonwebtoken';
import config from '../config/config.service';
import { RoleType } from '../drizzle/enums';
import logger from '../lib/logger.service';
import crypto from 'node:crypto';

export type JwtPayload = {
  sub: string;
  email?: string | null;
  phoneNo?: string | null;
  role: RoleType;
};

export type PasswordResetTokenPayload = {
  email: string;
  userId: string;
};

export type SetPasswordTokenPayload = {
  email: string;
  userId: string;
};

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

export const compareHash = async (
  hashed: string,
  plainPassword: string,
): Promise<boolean> => {
  return argon2.verify(hashed, plainPassword);
};

export const signToken = async (payload: JwtPayload): Promise<string> => {
  return sign(payload, String(config.JWT_SECRET), {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

export const signPasswordResetToken = async (
  payload: PasswordResetTokenPayload,
) => {
  return sign(payload, String(config.JWT_SECRET), {
    expiresIn: config.PASSWORD_RESET_TOKEN_EXPIRES_IN,
  });
};

export const signSetPasswordToken = async (
  payload: SetPasswordTokenPayload,
) => {
  return sign(payload, String(config.JWT_SECRET), {
    expiresIn: config.SET_PASSWORD_TOKEN_EXPIRES_IN,
  });
};

export const verifyToken = async <
  T extends JwtPayload | PasswordResetTokenPayload | SetPasswordTokenPayload,
>(
  token: string,
): Promise<T> => {
  try {
    return verify(token, String(config.JWT_SECRET)) as T;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }

    if (err instanceof JsonWebTokenError) {
      throw new Error(err.message);
    }

    logger.error('verifyToken', { err });
    throw err;
  }
};

export const generateRandomPassword = (length: number = 16): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const refinePassword = (password: string) => {
  const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
  const containsLowercase = (ch: string) => /[a-z]/.test(ch);
  const containsSpecialChar = (ch: string) =>
    /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
  let countOfUpperCase = 0,
    countOfLowerCase = 0,
    countOfNumbers = 0,
    countOfSpecialChar = 0;
  for (let i = 0; i < password.length; i++) {
    let ch = password.charAt(i);
    if (!isNaN(Number(ch))) countOfNumbers++;
    else if (containsUppercase(ch)) countOfUpperCase++;
    else if (containsLowercase(ch)) countOfLowerCase++;
    else if (containsSpecialChar(ch)) countOfSpecialChar++;
  }

  if (
    countOfLowerCase < 1 ||
    countOfUpperCase < 1 ||
    countOfSpecialChar < 1 ||
    countOfNumbers < 1
  ) {
    return false;
  }

  return true;
};
