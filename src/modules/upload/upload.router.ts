import { z } from 'zod';
import { canAccess } from '../../middlewares/can-access';
import MagicRouter from '../../openapi/magic-router';
import { R } from '../../openapi/response.builders';
import { zFile, zFiles } from '../../openapi/zod-extend';
import { handleProfileUpload } from './upload.controller';
import { uploadSchema } from './upload.schema';

export const UPLOAD_ROUTER_ROOT = '/upload';

const uploadRouter = new MagicRouter(UPLOAD_ROUTER_ROOT);

// Upload profile picture
uploadRouter.post(
  '/profile',
  {
    requestType: { body: uploadSchema },
    contentType: 'multipart/form-data',
    multipart: true,
    responses: {
      201: R.success(
        z.object({
          key: zFile(),
          filer: zFile(),
          multipleFiles: zFiles(),
        }),
      ),
    },
  },
  canAccess(),
  handleProfileUpload,
);

export default uploadRouter.getRouter();
