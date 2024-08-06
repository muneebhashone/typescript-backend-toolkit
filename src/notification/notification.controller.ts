import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import { NotificationFCMTokenSchemaType } from './notification.schema';
import { setFCMToken } from './notification.service';

export const handleSetFCMToken = async (
  req: Request<never, never, NotificationFCMTokenSchemaType>,
  res: Response,
) => {
  try {
    await setFCMToken({ fcmToken: req.body.fcmToken, userId: req.user?.sub });

    return successResponse(res, undefined);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
