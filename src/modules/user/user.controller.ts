import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { MongoIdSchemaType } from "../../common/common.schema";
import config from "../../config/config.service";
import { successResponse } from "../../utils/api.utils";
import { generateRandomPassword } from "../../utils/auth.utils";
import type { CreateUserSchemaType, GetUsersSchemaType } from "./user.schema";
import { createUser, deleteUser, getUsers } from "./user.services";

export const handleDeleteUser = async (
	req: Request<MongoIdSchemaType, unknown>,
	res: Response,
) => {
	await deleteUser({ id: req.params.id });

	return successResponse(res, "User has been deleted");
};

export const handleCreateUser = async (
	req: Request<unknown, unknown, CreateUserSchemaType>,
	res: Response,
) => {
	const data = req.body;

	const user = await createUser({
		...data,
		password: generateRandomPassword(),
		role: "DEFAULT_USER",
	});

	return successResponse(
		res,
		"Email has been sent to the user",
		user,
		StatusCodes.CREATED,
	);
};

export const handleCreateSuperAdmin = async (
	_: Request<unknown, unknown, unknown>,
	res: Response,
) => {
	
	const user = await createUser({
		email: config.ADMIN_EMAIL,
		name: "Super Admin",
		username: "super_admin",
		password: config.ADMIN_PASSWORD,
		role: "SUPER_ADMIN",
		phoneNo: "123456789",
		otp: null,
	});

	return successResponse(
		res,
		"Super Admin has been created",
		{ email: user.email, password: config.ADMIN_PASSWORD },
		StatusCodes.CREATED,
	);
};

export const handleGetUsers = async (
	req: Request<unknown, unknown, unknown, GetUsersSchemaType>,
	res: Response,
) => {
	const { results, paginatorInfo } = await getUsers(
		{
			id: req.user.sub,
		},
		req.query,
	);

	return successResponse(res, undefined, { results, paginatorInfo });
};
