import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import { updateUser } from '../user/user.services';
import { UserType } from '../types';
import { updateBusiness } from '../business/business.service';
import { BusinessIdSchemaType } from '../business/business.schema';

export const handleProfileUpload = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const currentUser = req.user as UserType;

    if ((file && !('location' in file)) || !file) {
      return errorResponse(res, 'File not uploaded, Please try again');
    }

    const user = await updateUser(
      { avatar: String(file.location) },
      currentUser.id,
    );

    return successResponse(res, 'Profile picture has been uploaded', user);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleBusinessThumbnailUpload = async (
  req: Request & { params: BusinessIdSchemaType },
  res: Response,
) => {
  try {
    const file = req.file;

    if ((file && !('location' in file)) || !file) {
      return errorResponse(res, 'File not uploaded, Please try again');
    }

    const business = await updateBusiness(
      { thumbnail: String(file.location) },
      req.params.id,
    );

    return successResponse(
      res,
      'Business thumbnail has been uploaded',
      business,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
