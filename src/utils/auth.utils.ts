import crypto from 'node:crypto';
import argon2 from 'argon2';
import { OAuth2Client } from 'google-auth-library';
import { JsonWebTokenError, sign, verify } from 'jsonwebtoken';
import config from '../config/config.service';
import type { RoleType } from '../enums';
import logger from '../lib/logger.service';

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface GoogleTokensRequestParams {
  code: string;
}

export type JwtPayload = {
  sub: string;
  email?: string | null;
  phoneNo?: string | null;
  username: string;
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
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

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
    expiresIn: Number(config.JWT_EXPIRES_IN) * 1000,
  });
};

export const signPasswordResetToken = async (
  payload: PasswordResetTokenPayload,
) => {
  return sign(payload, String(config.JWT_SECRET), {
    expiresIn: config.PASSWORD_RESET_TOKEN_EXPIRES_IN * 1000,
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

export const generateRandomPassword = (length = 16): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateOTP = (length = 6): string => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export const verifyGoogleIdToken = async (idToken: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const { sub, email, name, picture, email_verified, exp } = payload;

    if (!email) {
      throw new Error('Email not found in token payload');
    }

    return {
      googleId: sub,
      email,
      name: name || email.split('@')[0],
      picture,
      emailVerified: email_verified,
      tokenExpiry: exp,
    };
  } catch (error) {
    logger.error('Error verifying Google ID token', { error });
    throw new Error('Failed to verify Google ID token');
  }
};
