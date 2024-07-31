import { Router } from 'express';
import { canAccess } from '../../middlewares/can-access.middleware';
import { validateZodSchema } from '../../middlewares/validate-zod-schema.middleware';
import {
  handleCreateCarBooking,
  handleDeleteCarBooking,
  handleDeleteCarBookings,
  handleGetCarBooking,
  handleGetCarBookings,
} from './car-booking.controller';
import { carBookingSchema, carBookingIdSchema } from './car-booking.schema';

export const CAR_BOOKING_ROUTER_ROOT = '/car-booking';

const carBookingRouter = Router();

carBookingRouter.get('/', handleGetCarBookings);

carBookingRouter.post(
  '/',
  canAccess('roles', ['DEFAULT_USER', 'SUPER_ADMIN']),
  validateZodSchema({ body: carBookingSchema }),
  handleCreateCarBooking,
);

carBookingRouter.delete(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  handleDeleteCarBookings,
);

carBookingRouter.get(
  '/:id',
  validateZodSchema({ params: carBookingIdSchema }),
  handleGetCarBooking,
);

carBookingRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ params: carBookingIdSchema }),
  handleDeleteCarBooking,
);

export default carBookingRouter;
