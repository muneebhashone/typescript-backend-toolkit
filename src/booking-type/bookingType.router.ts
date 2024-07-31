import { Router } from 'express';
import {
  handleCreateBookingType,
  handleDeleteBookingType,
  handleGetBookingTypes,
  handleSeedBookingTypes,
  handleUpdateBookingType,
} from './bookingType.controller';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  bookingTypeCreateOrUpdateSchema,
  bookingTypeIdSchema,
} from './bookingType.schema';

export const BOOKING_TYPE_ROUTER_ROOT = '/booking-type';

const bookingTypeRouter = Router();

bookingTypeRouter.get('/', handleGetBookingTypes);

bookingTypeRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedBookingTypes,
);

bookingTypeRouter.post(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: bookingTypeCreateOrUpdateSchema }),
  handleCreateBookingType,
);

bookingTypeRouter.patch(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    body: bookingTypeCreateOrUpdateSchema,
    params: bookingTypeIdSchema,
  }),
  handleUpdateBookingType,
);

bookingTypeRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: bookingTypeIdSchema,
  }),
  handleDeleteBookingType,
);

export default bookingTypeRouter;
