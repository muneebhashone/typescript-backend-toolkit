import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "../config/config.service";
import logger from "../lib/logger.service";
import type { ResponseExtended } from "../types";

export const errorResponse = (
	res: ResponseExtended | Response,
	message?: string,
	statusCode?: StatusCodes,
	payload?: unknown,
	stack?: string,
): void => {
	try {
		if ("jsonValidate" in res) {
			(res as ResponseExtended)
				.status(statusCode ?? StatusCodes.BAD_REQUEST)
				.jsonValidate({
					success: false,
					message: message,
					data: payload,
					stack: stack,
				});
		} else {
			(res as ResponseExtended)
				.status(statusCode ?? StatusCodes.BAD_REQUEST)
				.json({
					success: false,
					message: message,
					data: payload,
					stack: stack,
				});
		}

		return;
	} catch (err) {
		logger.error(err);
	}
};

export const successResponse = (
	res: ResponseExtended | Response,
	message?: string,
	payload?: Record<string, unknown>,
	statusCode: StatusCodes = StatusCodes.OK,
): void => {
	try {
		if ("jsonValidate" in res) {
			(res as ResponseExtended)
				.status(statusCode)
				.jsonValidate({ success: true, message: message, data: payload });
		} else {
			(res as ResponseExtended)
				.status(statusCode)
				.json({ success: true, message: message, data: payload });
		}

		return;
	} catch (err) {
		logger.error(err);
	}
};

export const generateResetPasswordLink = (token: string) => {
	return `${config.CLIENT_SIDE_URL}/reset-password?token=${token}`;
};

export const generateSetPasswordLink = (token: string) => {
	return `${config.CLIENT_SIDE_URL}/set-password?token=${token}`;
};
