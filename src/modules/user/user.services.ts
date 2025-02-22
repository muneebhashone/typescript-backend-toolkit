import type { FilterQuery } from "mongoose";
import type { MongoIdSchemaType } from "../../common/common.schema";
import { hashPassword } from "../../utils/auth.utils";
import { getPaginator } from "../../utils/getPaginator";
import type { UserModelType, UserType } from "./user.dto";
import User, { type IUserDocument } from "./user.model";
import type { GetUsersSchemaType } from "./user.schema";

export const updateUser = async (
	userId: string,
	payload: Partial<UserType>,
): Promise<UserType> => {
	const user = await User.findOneAndUpdate(
		{
			_id: userId,
		},
		{ $set: { ...payload } },
		{
			new: true,
		},
	);

	if (!user) throw new Error("User not found");

	return user.toObject();
};

export const getUserById = async (userId: string, select?: string) => {
	const user = await User.findOne({
		_id: userId,
	}).select(select ?? "");

	if (!user) {
		throw new Error("User not found");
	}

	return user.toObject();
};

export const getUserByEmail = async (
	email: string,
	select?: string,
): Promise<UserType | null> => {
	const user = await User.findOne({ email }).select(select ?? "");

	return user?.toObject() ?? null;
};

export const deleteUser = async (userId: MongoIdSchemaType) => {
	const user = await User.findByIdAndDelete({ _id: userId.id });

	if (!user) {
		throw new Error("User not found");
	}
};

export const getUsers = async (
	userId: MongoIdSchemaType,
	payload: GetUsersSchemaType,
) => {
	const { id } = userId;
	const currentUser = await User.findById({ _id: id });
	if (!currentUser) {
		throw new Error("User must be logged in");
	}

	const conditions: FilterQuery<IUserDocument> = {};

	if (payload.searchString) {
		conditions.$or = [
			{ firstName: { $regex: payload.searchString, $options: "i" } },
			{ lastName: { $regex: payload.searchString, $options: "i" } },
			{ email: { $regex: payload.searchString, $options: "i" } },
		];
	}

	if (payload.filterByRole) {
		conditions.role = payload.filterByRole;
	} else {
		conditions.role = { $in: ["DEFAULT_USER"] };
	}

	const totalRecords = await User.countDocuments(conditions);
	const paginatorInfo = getPaginator(
		payload.limitParam,
		payload.pageParam,
		totalRecords,
	);

	const results = await User.find(conditions)
		.limit(paginatorInfo.limit)
		.skip(paginatorInfo.skip)
		.exec();

	return {
		results,
		paginatorInfo,
	};
};

export const createUser = async (
	payload: UserModelType & { password: string },
	checkExist = true,
): Promise<UserType> => {
	if (checkExist) {
		const isUserExist = await User.findOne({ email: payload.email });

		if (isUserExist) {
			throw new Error("User already exists");
		}
	}

	if (!payload.password) {
		throw new Error("Password is required");
	}

	const hashedPassword = await hashPassword(payload.password);

	const createdUser = await User.create({
		...payload,
		password: hashedPassword,
	});

	return { ...createdUser.toObject(), password: "", otp: null };
};
