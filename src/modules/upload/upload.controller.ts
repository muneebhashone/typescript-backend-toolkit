import type { Request } from 'express';
import { uploadFile } from '@/lib/storage';
import type { ResponseExtended } from '@/types';
import { errorResponse } from '@/utils/response.utils';
import type { UserType } from '../user/user.dto';
import { updateUser } from '../user/user.services';
import { UploadSchema, UploadResponseSchema } from './upload.schema';

export const handleProfileUpload = async (
  req: Request<null, null, UploadSchema>,
  res: ResponseExtended<UploadResponseSchema>,
) => {
  try {
    const avatar = req.body.avatar;
    const multipleFiles = req.body.multipleFiles;
    const currentUser = req.user as unknown as UserType;

    if (!avatar) {
      return errorResponse(res, 'File not uploaded, Please try again');
    }

    // Upload to S3
    const key = `user-${currentUser._id}/profile/${avatar.originalFilename}`;
    const { url } = await uploadFile({ file: avatar, key });

    // Update user profile
    await updateUser(String(currentUser._id), {
      avatar: url,
    });
    return res.created?.({
      success: true,
      message: 'File uploaded successfully',
      data: {
        key: avatar,
        multipleFiles,
      },
    });
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
