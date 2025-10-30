/**
 * Remove null and undefined values from a record
 * @param record - Record to sanitize
 * @returns New record with null/undefined values removed
 */
export const sanitizeRecord = <T extends Record<string, unknown>>(
  record: T,
): T => {
  try {
    return Object.fromEntries(
      Object.entries(record).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    ) as T;
  } catch {
    return record;
  }
};

/**
 * Remove entries with empty arrays from a record
 * Keeps all non-array fields and non-empty arrays
 * @param record - Record to filter
 * @returns New record with empty array entries removed
 */
export const removeEmptyArrays = <T extends Record<string, unknown>>(
  record: T,
): T => {
  try {
    return Object.fromEntries(
      Object.entries(record).filter(([_, value]) => {
        // Keep non-array values
        if (!Array.isArray(value)) return true;
        // Keep non-empty arrays
        return value.length > 0;
      }),
    ) as T;
  } catch {
    return record;
  }
};
