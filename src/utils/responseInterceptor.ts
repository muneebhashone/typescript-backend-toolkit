import type { NextFunction } from "express";
import { ZodError } from "zod";
import type { RequestExtended, ResponseExtended } from "../types";

const responseInterceptor = (
	_: RequestExtended,
	res: ResponseExtended,
	next: NextFunction,
) => {
	const originalJson = res.json;
	const originalSend = res.send;
	const validateSchema = res.locals.validateSchema ?? null;

	res.jsonValidate = function (body) {
		if (validateSchema) {
			try {
				validateSchema.parse(body);
			} catch (err) {
				if (err instanceof ZodError) {
					return originalJson.call(this, {
						success: false,
						message: "Response Validation Error - Server Error",
						data: err.errors,
						stack: err.stack,
					});
				}
			}
		}

		return originalJson.call(
			this,
			validateSchema ? validateSchema.parse(body) : body,
		);
	};

	res.sendValidate = function (body) {
		if (validateSchema) {
			try {
				validateSchema.parse(body);
			} catch (err) {
				if (err instanceof ZodError) {
					return originalSend.call(this, {
						success: false,
						message: "Response Validation Error - Server Error",
						data: err.errors,
						stack: err.stack,
					});
				}
			}
		}

		return originalSend.call(
			this,
			validateSchema ? validateSchema.parse(body) : body,
		);
	};

	next();
};

export default responseInterceptor;
