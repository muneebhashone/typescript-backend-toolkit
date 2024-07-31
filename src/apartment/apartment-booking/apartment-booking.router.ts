import { Router } from 'express';
import { canAccess } from '../../middlewares/can-access.middleware';
import { validateZodSchema } from '../../middlewares/validate-zod-schema.middleware';
import {
  handleGetMyApartmentBookings,
  handleRefundApartmentBooking,
} from './apartment-booking.controller';
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
  myBookingsSchema,
} from './apartment-booking.schema';

export const APARTMENT_BOOKING_ROUTER_ROOT = '/apartment-booking';

const apartmentBookingRouter = Router();

apartmentBookingRouter.get('/', handleGetApartmentBookings);

apartmentBookingRouter.post(
  '/',
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({ body: confirmApartmentBookingSchema }),
  handleCreateApartmentBooking,
);

apartmentBookingRouter.post(
  '/my',
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({ query: myBookingsSchema }),
  handleGetMyApartmentBookings,
);

apartmentBookingRouter.post(
  '/summary',
  validateZodSchema({ body: apartmentBookingCreateOrUpdateSchema }) ,
  handleGetApartmentBookingSummary,
);

apartmentBookingRouter.delete(
  '/:id',
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({
    params: apartmentBookingIdSchema,
  }),
  handleDeleteApartmentBooking,
);

apartmentBookingRouter.patch(
  '/:id/refund',
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({
    params: apartmentBookingIdSchema,
  }),
  handleRefundApartmentBooking,
);

export default apartmentBookingRouter;
