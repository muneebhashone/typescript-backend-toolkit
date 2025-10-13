import type { Request } from 'express';
import type { ResponseExtended } from '../../types';
import { errorResponse } from '../../utils/api.utils';
import type { UserType } from '../user/user.dto';
import { updateUser } from '../user/user.services';

// Using new res.created() helper
export const handleProfileUpload = async (
  req: Request,
  res: ResponseExtended,
) => {
  try {
    const file = req.file;

    const currentUser = req.user as UserType;

    if ((file && !('location' in file)) || !file) {
      return errorResponse(res, 'File not uploaded, Please try again');
    }

    await updateUser(String(currentUser._id), {
      avatar: String(file.location),
    });

    return res.created?.({
      success: true,
      message: 'Profile picture has been uploaded',
      data: {
        url: String(file.location),
        key: (file as { key?: string }).key,
      },
    });
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
