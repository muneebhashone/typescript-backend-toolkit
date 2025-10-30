import argon2 from 'argon2';

/**
 * Hash a password using Argon2
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

/**
 * Compare a plain text password with a hashed password
 * @param hashed - Hashed password
 * @param plainPassword - Plain text password to compare
 * @returns True if passwords match, false otherwise
 */
export const compareHash = async (
  hashed: string,
  plainPassword: string,
): Promise<boolean> => {
  return argon2.verify(hashed, plainPassword);
};
