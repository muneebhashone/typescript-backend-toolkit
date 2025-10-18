import type { Request } from 'express';
import { uploadToS3, validateImage } from '../../lib/s3-upload';
import type { FormFile, ResponseExtended } from '../../types';
import { errorResponse } from '../../utils/api.utils';
import type { UserType } from '../user/user.dto';
import { updateUser } from '../user/user.services';
import { UploadSchema } from './upload.schema';

// Using new res.created() helper
export const handleProfileUpload = async (
  req: Request<{}, {}, UploadSchema>,
  res: ResponseExtended,
) => {
  try {
    const avatar = req.body.avatar;
    const filer = req.body.filer
    const multipleFiles = req.body.multipleFiles
    const currentUser = req.user as UserType;

    if (!avatar) {
      return errorResponse(res, 'File not uploaded, Please try again');
    }

    // Validate image type
    if (!validateImage(avatar)) {
      return errorResponse(res, 'Invalid file type. Only JPEG and PNG are allowed');
    }

    // Upload to S3
    const key = `user-${currentUser._id}/profile/${avatar.originalFilename}`;
    const { url, key: uploadedKey } = await uploadToS3(avatar, key);

    // Update user profile
    await updateUser(String(currentUser._id), {
      avatar: url,
    });

    return res.created?.({
      success: true,
      message: 'Profile picture has been uploaded',
      data: {
        key: avatar,
        filer: filer,
        multipleFiles: multipleFiles,
      },
    });
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
