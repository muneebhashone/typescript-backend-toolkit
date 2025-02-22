import type { NextFunction, Request, Response } from "express";
import config from "../config/config.service";
import logger from "../lib/logger.service";
import type { RequestExtended, ResponseExtended } from "../types";
import { errorResponse } from "./api.utils";

interface CustomError extends Error {
	status?: number;
	message: string;
}

export const globalErrorHandler = (
	err: CustomError,
	_: RequestExtended | Request,
	res: ResponseExtended | Response,
	__: NextFunction,
): void => {
	const statusCode = err.status || 500;
	const errorMessage = err.message || "Internal Server Error";

	logger.error(`${statusCode}: ${errorMessage}`);

	errorResponse(
		res as ResponseExtended,
		errorMessage,
		statusCode,
		err,
		config.NODE_ENV === "development" ? err.stack : undefined,
	);

	return;
};

export default globalErrorHandler;
