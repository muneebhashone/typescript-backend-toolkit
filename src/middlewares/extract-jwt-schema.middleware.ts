import type { NextFunction } from "express";
import { type JwtPayload, verifyToken } from "../utils/auth.utils";
import type { RequestAny, ResponseAny } from "../openapi/magic-router";

export const extractJwt = async (
	req: RequestAny,
	_: ResponseAny,
	next: NextFunction,
) => {
	try {
		const token =
			req.cookies?.accessToken ?? req.headers.authorization?.split(" ")[1];

		if (!token) {
			return next();
		}

		const decode = await verifyToken<JwtPayload>(token);

		req.user = decode;
		return next();
	} catch {
		return next();
	}
};
