import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/api.utils';
import {
  ApartmentBookingCreateOrUpdateSchemaType,
  ApartmentBookingIdSchemaType,
  ConfirmApartmentBookingSchema,
  MyApartmentBookingsSchema,
} from './apartment-booking.schema';
import {
  confirmApartmentBooking,
  deleteApartmentBooking,
  getApartmentBooking,
  createApartmentBookingSummary,
  getMyApartmentBooking,
  refundApartmentBooking,
  getApartmentBookingSummary,
  cancelApartmentBooking,
} from './apartment-booking.service';

export const handleGetApartmentBookings = async (_: Request, res: Response) => {
  try {
    const result = await getApartmentBooking();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetApartmentBookingSummary = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await getApartmentBookingSummary({ id: req.params.id });

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleConfirmApartmentBooking = async (
  req: Request<never, never, ConfirmApartmentBookingSchema>,
  res: Response,
) => {
  try {
    const newApartmentBooking = await confirmApartmentBooking(req.body);

    return successResponse(
      res,
      'ApartmentBooking created successfully',
      newApartmentBooking,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteApartmentBooking = async (
  req: Request<ApartmentBookingIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    await deleteApartmentBooking({ id: req.params.id });

    return successResponse(res, 'ApartmentBooking deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateApartmentBookingSummary = async (
  req: Request<never, never, ApartmentBookingCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const newBooking = await createApartmentBookingSummary(req.body, req.user);

    return successResponse(
      res,
      'Apartment Booking created successfully',
      newBooking,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetMyApartmentBookings = async (
  req: Request<never, never, MyApartmentBookingsSchema>,
  res: Response,
) => {
  try {
    const myBookings = await getMyApartmentBooking(req.query, req.user);

    return successResponse(res, undefined, myBookings);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleRefundApartmentBooking = async (
  req: Request<ApartmentBookingIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    const response = await refundApartmentBooking({ id: req.params.id });

    return successResponse(res, undefined, response);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
export const handleCancelApartmentBooking = async (
  req: Request<ApartmentBookingIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    const response = await cancelApartmentBooking({ id: req.params.id });

    return successResponse(res, undefined, response);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
