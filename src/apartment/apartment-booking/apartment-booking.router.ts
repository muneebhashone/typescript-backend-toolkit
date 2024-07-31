import { Router } from 'express';
import { canAccess } from '../../middlewares/can-access.middleware';
import { validateZodSchema } from '../../middlewares/validate-zod-schema.middleware';
import {
  handleCreateApartmentBooking,
  handleDeleteApartmentBooking,
  handleGetApartmentBookings,
  handleGetApartmentBookingSummary,
} from './apartment-booking.controller';
import {
  apartmentBookingCreateOrUpdateSchema,
  apartmentBookingIdSchema,
  confirmApartmentBookingSchema,
} from './apartment-booking.schema';

export const APARTMENT_BOOKING_ROUTER_ROOT = '/apartment-booking';

const apartmentBookingRouter = Router();

apartmentBookingRouter.get('/', handleGetApartmentBookings);

apartmentBookingRouter.post(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: confirmApartmentBookingSchema }),
  handleCreateApartmentBooking,
);

apartmentBookingRouter.post(
  '/my',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: confirmApartmentBookingSchema }),
  handleCreateApartmentBooking,
);

apartmentBookingRouter.post(
  '/summary',
  validateZodSchema({ body: apartmentBookingCreateOrUpdateSchema }),
  handleGetApartmentBookingSummary,
);

apartmentBookingRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: apartmentBookingIdSchema,
  }),
  handleDeleteApartmentBooking,
);

export default apartmentBookingRouter;
