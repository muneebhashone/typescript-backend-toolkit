const transformableToBooleanTruthy = ['true', 'TRUE', 't', 'T', '1'];
const transformableToBooleanFalsy = ['false', 'FALSE', 'f', 'F', '0'];

export const transformableToBooleanError = `Value must be one of ${transformableToBooleanTruthy.join(', ')} or ${transformableToBooleanFalsy.join(', ')}`;

export const stringToBoolean = (value: string): boolean => {
  if (transformableToBooleanTruthy.includes(value)) {
    return true;
  }

  if (transformableToBooleanFalsy.includes(value)) {
    return false;
  }

  throw new Error('Value is not transformable to boolean');
};

export const isTransformableToBoolean = (value: string) => {
  if (
    !transformableToBooleanTruthy.includes(value) &&
    !transformableToBooleanFalsy.includes(value)
  ) {
    return false;
  }

  return true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeRecord = <T extends Record<any, any>>(record: T): T => {
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

export const generateRandomNumbers = (length: number): string => {
  let id = '';

  for (let i = 0; i < length; i++) {
    id += String(Math.round(Math.random() * i) + 1)[0];
  }

  return id;
};
