import { canAccess } from '../../middlewares/can-access';
import MagicRouter from '../../openapi/magic-router';
import { handleProfileUpload } from './upload.controller';
import { uploadResponseSchema, uploadSchema } from './upload.schema';

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
    "201": uploadResponseSchema,
    },
  },
  canAccess(),
  handleProfileUpload,
);

export default uploadRouter.getRouter();
