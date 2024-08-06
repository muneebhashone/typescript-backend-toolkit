import { Router } from 'express';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import { handleSetFCMToken } from './notification.controller';
import { NotificationFCMTokenSchema } from './notification.schema';

export const NOTIFICATION_ROUTER_ROOT = '/notification';

const notificationRouter = Router();

notificationRouter.post(
  '/set-fcm-token',
  validateZodSchema({ body: NotificationFCMTokenSchema }),
  handleSetFCMToken,
);

export default notificationRouter;
