import type { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import type { RoleType } from "../enums";
import { getUserById } from "../modules/user/user.services";
import { errorResponse } from "../utils/api.utils";
import type { JwtPayload } from "../utils/auth.utils";
import type { RequestAny, ResponseAny } from "../openapi/magic-router";

export type CanAccessByType = "roles";

export type CanAccessOptions = {
	roles: RoleType | "*";
};

export const canAccess =
	<T extends CanAccessByType>(by?: T, access?: CanAccessOptions[T][]) =>
	async (req: RequestAny, res: ResponseAny, next?: NextFunction) => {
		try {
			const requestUser = req?.user as JwtPayload;

			if (!requestUser) {
				return errorResponse(
					res,
					"token isn't attached or expired",
					StatusCodes.UNAUTHORIZED,
				);
			}
			const currentUser = await getUserById(requestUser.sub);

			if (!currentUser) {
				return errorResponse(res, "Login again", StatusCodes.UNAUTHORIZED);
			}

			if (currentUser.otp !== null) {
				return errorResponse(
					res,
					"Your account is not verified",
					StatusCodes.UNAUTHORIZED,
				);
			}

			let can = false;

			const accessorsToScanFor = access;

			if (by === "roles" && accessorsToScanFor) {
				can = (accessorsToScanFor as RoleType[]).includes(
					currentUser.role as RoleType,
				);
			}

			if (!accessorsToScanFor) {
				can = Boolean(currentUser.email);
			}

			if (!can && by === "roles") {
				return errorResponse(
					res,
					"User is not authorized to perform this action",
					StatusCodes.UNAUTHORIZED,
					{ [`${by}_required`]: access },
				);
			}

			if (currentUser && !by && !access) {
				can = true;
			}

			if (!can) {
				return errorResponse(
					res,
					"User is not authenticated",
					StatusCodes.UNAUTHORIZED,
					access,
				);
			}

			if (currentUser) {
				req.user = { ...currentUser, sub: currentUser._id };
			}
		} catch (err) {
			return errorResponse(
				res,
				(err as Error).message,
				StatusCodes.UNAUTHORIZED,
				access,
			);
		}

		next?.();
	};
