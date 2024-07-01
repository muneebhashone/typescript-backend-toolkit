import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import {
  uploadBusinessThumbnail,
  uploadProfile,
} from '../middlewares/multer-s3.middleware';
import {
  handleBusinessThumbnailUpload,
  handleProfileUpload,
} from './upload.controller';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import { businessIdSchema } from '../business/business.schema';

export const UPLOAD_ROUTER_ROOT = '/upload';

const uploadRouter = Router();

uploadRouter.post('/profile', canAccess(), uploadProfile, handleProfileUpload);

uploadRouter.post(
  '/business-thumbnail/:id',
  canAccess(),
  validateZodSchema({ params: businessIdSchema }),
  uploadBusinessThumbnail,
  handleBusinessThumbnailUpload,
);

export default uploadRouter;
