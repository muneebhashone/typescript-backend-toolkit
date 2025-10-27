import config from '@/config/env';

/**
 * Generate a password reset link with the given token
 * @param token - Password reset token
 * @returns Full URL for password reset
 */
export const generateResetPasswordLink = (token: string): string => {
  return `${config.CLIENT_SIDE_URL}/reset-password?token=${token}`;
};

/**
 * Generate a set password link with the given token
 * @param token - Set password token
 * @returns Full URL for setting password
 */
export const generateSetPasswordLink = (token: string): string => {
  return `${config.CLIENT_SIDE_URL}/set-password?token=${token}`;
};
