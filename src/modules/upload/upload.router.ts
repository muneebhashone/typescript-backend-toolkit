import { z } from 'zod';
import { canAccess } from '../../middlewares/can-access';
import { uploadProfile } from '../../middlewares/multer-s3';
import MagicRouter from '../../openapi/magic-router';
import { R } from '../../openapi/response.builders';
import { zFile } from '../../openapi/zod-extend';
import { handleProfileUpload } from './upload.controller';

export const UPLOAD_ROUTER_ROOT = '/upload';

const uploadRouter = new MagicRouter(UPLOAD_ROUTER_ROOT);

// Upload profile picture
uploadRouter.post(
  '/profile',
  {
    requestType: { body: z.object({ avatar: zFile() }) },
    contentType: 'multipart/form-data',
    responses: {
      201: R.success(
        z.object({
          url: z.string().url(),
          key: z.string().optional(),
        }),
      ),
    },
  },
  canAccess(),
  uploadProfile,
  handleProfileUpload,
);

export default uploadRouter.getRouter();
