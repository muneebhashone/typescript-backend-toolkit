import type { Request, Response } from "express";
import type { UserType } from "../modules/user/user.dto";
import { updateUser } from "../modules/user/user.services";
import { errorResponse, successResponse } from "../utils/api.utils";

export const handleProfileUpload = async (req: Request, res: Response) => {
	try {
		const file = req.file;
		const currentUser = req.user as UserType;

		if ((file && !("location" in file)) || !file) {
			return errorResponse(res, "File not uploaded, Please try again");
		}

		const user = await updateUser(
			{ avatar: String(file.location) },
			{ id: String(currentUser._id) },
		);

		return successResponse(res, "Profile picture has been uploaded", user);
	} catch (err) {
		return errorResponse(res, (err as Error).message);
	}
};
