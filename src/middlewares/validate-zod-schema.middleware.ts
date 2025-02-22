import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, type ZodSchema } from "zod";
import type { RequestZodSchemaType } from "../types";
import { errorResponse } from "../utils/api.utils";
import { sanitizeRecord } from "../utils/common.utils";

export const validateZodSchema =
	(payload: RequestZodSchemaType) =>
	(req: Request, res: Response, next?: NextFunction) => {
		let error: ZodError | null = null;

		for (const [key, value] of Object.entries(payload)) {
			const typedProp = [key, value] as [keyof RequestZodSchemaType, ZodSchema];
			const [typedKey, typedValue] = typedProp;

			const parsed = typedValue.safeParse(req[typedKey]);

			if (!parsed.success) {
				if (error instanceof ZodError) {
					error.addIssues(parsed.error.issues);
				} else {
					error = parsed.error;
				}
			}

			req[typedKey] = sanitizeRecord(parsed.data);
		}

		if (error) {
			return errorResponse(
				res,
				"Invalid input",
				StatusCodes.BAD_REQUEST,
				error,
			);
		}

		next?.();
	};
