import { Router } from 'express';
import { canAccess } from '../../middlewares/can-access.middleware';
import { validateZodSchema } from '../../middlewares/validate-zod-schema.middleware';
import {
  handleCancelApartmentBooking,
  handleCreateApartmentBookingSummary,
  handleGetMyApartmentBookings,
  handleRefundApartmentBooking,
} from './apartment-booking.controller';
import {
  handleConfirmApartmentBooking,
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
  handleConfirmApartmentBooking,
);

apartmentBookingRouter.get(
  '/my',
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({ query: myBookingsSchema }),
  handleGetMyApartmentBookings,
);

apartmentBookingRouter.post(
  '/summary',
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({ body: apartmentBookingCreateOrUpdateSchema }),
  handleCreateApartmentBookingSummary,
);

apartmentBookingRouter.delete(
  '/:id',
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({
    params: apartmentBookingIdSchema,
  }),
  handleDeleteApartmentBooking,
);

apartmentBookingRouter.get(
  '/:id/refund',
  canAccess('roles', ['DEFAULT_USER']),
  validateZodSchema({
    params: apartmentBookingIdSchema,
  }),
  handleRefundApartmentBooking,
);
apartmentBookingRouter.get(
  '/:id/cancel',
  canAccess('roles', ['DEFAULT_USER', 'VENDOR']),
  validateZodSchema({
    params: apartmentBookingIdSchema,
  }),
  handleCancelApartmentBooking,
);
apartmentBookingRouter.get(
  '/:id/summary',
  canAccess('roles', ['DEFAULT_USER']),
  handleGetApartmentBookingSummary,
);

export default apartmentBookingRouter;
