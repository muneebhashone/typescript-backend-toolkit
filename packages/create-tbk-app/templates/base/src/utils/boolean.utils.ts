const TRUTHY_VALUES = ['true', 't', '1'];
const FALSY_VALUES = ['false', 'f', '0'];

export const transformableToBooleanError = `Value must be one of ${TRUTHY_VALUES.join(', ')} or ${FALSY_VALUES.join(', ')} (case-insensitive)`;

/**
 * Convert a string to a boolean value
 * Supports: 'true', 't', '1' (case-insensitive) -> true
 *           'false', 'f', '0' (case-insensitive) -> false
 * @param value - String value to convert
 * @returns Boolean value
 * @throws Error if value cannot be converted to boolean
 */
export const stringToBoolean = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();

  if (TRUTHY_VALUES.includes(normalized)) {
    return true;
  }

  if (FALSY_VALUES.includes(normalized)) {
    return false;
  }

  throw new Error(
    `Value "${value}" is not transformable to boolean. ${transformableToBooleanError}`,
  );
};

/**
 * Check if a string value can be converted to a boolean
 * @param value - String value to check
 * @returns True if value can be converted to boolean, false otherwise
 */
export const isTransformableToBoolean = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return TRUTHY_VALUES.includes(normalized) || FALSY_VALUES.includes(normalized);
};
