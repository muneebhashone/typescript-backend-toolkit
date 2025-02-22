import type { Request, Response } from "express";
import type { Server } from "socket.io";
import type { AnyZodObject, ZodEffects, ZodSchema } from "zod";
import type { JwtPayload } from "./utils/auth.utils";

export type ZodObjectWithEffect =
	| AnyZodObject
	| ZodEffects<ZodObjectWithEffect, unknown, unknown>;

export interface GoogleCallbackQuery {
	code: string;
	error?: string;
}

export type RequestZodSchemaType = {
	params?: ZodObjectWithEffect;
	query?: ZodObjectWithEffect;
	body?: ZodSchema;
};

export interface RequestExtended extends Request {
	user: JwtPayload;
	io: Server;
}

export interface ResponseExtended extends Response {
	locals: {
		validateSchema?: ZodSchema;
	};
	jsonValidate: Response["json"];
	sendValidate: Response["send"];
}
