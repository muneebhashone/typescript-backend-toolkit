import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/api.utils';
import {
  getCarBookings,
  getCarBooking,
  createCarBooking,
  deleteCarBooking,
  deleteCarBookings,
} from './car-booking.services';
import {
  CarBookingSchemaType,
  CarBookingIdSchemaType,
} from './car-booking.schema';

export const handleGetCarBookings = async (_: Request, res: Response) => {
  try {
    const results = await getCarBookings();
    return successResponse(res, undefined, results);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetCarBooking = async (
  req: Request<CarBookingIdSchemaType>,
  res: Response,
) => {
  try {
    const result = await getCarBooking({ id: req.params.id });
    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateCarBooking = async (
  req: Request<never, never, CarBookingSchemaType>,
  res: Response,
) => {
  try {
    const newCarBooking = await createCarBooking(req.body, req.user);
    return successResponse(
      res,
      'Car booking created successfully',
      newCarBooking,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteCarBooking = async (
  req: Request<CarBookingIdSchemaType>,
  res: Response,
) => {
  try {
    await deleteCarBooking({ id: req.params.id });
    return successResponse(res, 'Car booking deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteCarBookings = async (_: Request, res: Response) => {
  try {
    await deleteCarBookings();
    return successResponse(res, 'All car bookings deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
