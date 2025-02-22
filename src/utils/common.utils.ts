import path from "node:path";
import { customAlphabet } from "nanoid";
import config from "../config/config.service";

export const customNanoId = customAlphabet("0123456789", 4);

const transformableToBooleanTruthy = ["true", "TRUE", "t", "T", "1"];
const transformableToBooleanFalsy = ["false", "FALSE", "f", "F", "0"];

export const transformableToBooleanError = `Value must be one of ${transformableToBooleanTruthy.join(", ")} or ${transformableToBooleanFalsy.join(", ")}`;

export const stringToBoolean = (value: string): boolean => {
	if (transformableToBooleanTruthy.includes(value)) {
		return true;
	}

	if (transformableToBooleanFalsy.includes(value)) {
		return false;
	}

	throw new Error("Value is not transformable to boolean");
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

export const checkRecordForEmptyArrays = <T extends Record<string, unknown>>(
	record: T,
): T => {
	try {
		return Object.fromEntries(
			Object.entries(record).filter(
				([_, value]) => Array.isArray(value) && !!value.length,
			),
		) as T;
	} catch {
		return record;
	}
};

export const generateRandomNumbers = (length: number): string => {
	let id = "";

	if (config.STATIC_OTP) {
		id = "1234";
	} else {
		id = customNanoId(length);
	}

	return id;
};

export const checkFiletype = (file: Express.Multer.File): boolean => {
	const filetypes = /jpeg|jpg|png/;

	const checkExtname = filetypes.test(
		path.extname(file.originalname).toLowerCase(),
	);
	const checkMimetype = filetypes.test(file.mimetype);

	return checkExtname && checkMimetype;
};
