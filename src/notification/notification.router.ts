import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import { NotificationFCMTokenSchema } from './notification.schema';
import { handleSetFCMToken } from './notification.controller';

export const NOTIFICATION_ROUTER_ROOT = '/notification';

const notificationRouter = Router();

notificationRouter.post(
  '/set-fcm-token',
  validateZodSchema({ body: NotificationFCMTokenSchema }),
  handleSetFCMToken,
);

export default notificationRouter;
