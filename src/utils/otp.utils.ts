import crypto from 'node:crypto';
import { customAlphabet } from 'nanoid';
import config from '../config/env';

export const numericNanoId = customAlphabet('0123456789', 6);
export const hexChars = '0123456789abcdef';
export const alphanumericChars =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export type OtpCharset = 'numeric' | 'hex' | 'alphanumeric';

export interface GenerateOtpOptions {
  length?: number;
  charset?: OtpCharset;
}

/**
 * Generate a one-time password (OTP) with configurable length and character set
 * @param options - OTP generation options
 * @param options.length - Length of the OTP (default: 6)
 * @param options.charset - Character set to use: 'numeric', 'hex', or 'alphanumeric' (default: 'numeric')
 * @returns Generated OTP string
 */
export const generateOtp = (options: GenerateOtpOptions = {}): string => {
  const { length = 6, charset = 'numeric' } = options;

  // Return static OTP for testing if configured
  if (config.STATIC_OTP) {
    return '1234'.padEnd(length, '4').slice(0, length);
  }

  switch (charset) {
    case 'numeric': {
      const generator = customAlphabet('0123456789', length);
      return generator();
    }
    case 'hex': {
      return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
    }
    case 'alphanumeric': {
      const generator = customAlphabet(alphanumericChars, length);
      return generator();
    }
    default:
      throw new Error(`Unsupported charset: ${charset}`);
  }
};

/**
 * Generate a random password with specified length
 * @param length - Length of the password (default: 16)
 * @returns Random password string
 */
export const generateRandomPassword = (length = 16): string => {
  return crypto.randomBytes(length).toString('hex');
};
