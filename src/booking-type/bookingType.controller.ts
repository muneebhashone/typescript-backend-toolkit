import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import { getBookingType, seedBookingTypes } from './bookingType.service';

export const handleSeedBookingTypes = async (_: Request, res: Response) => {
  try {
    const result = await seedBookingTypes();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetBookingTypes = async (_: Request, res: Response) => {
  try {
    const result = await getBookingType();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

// export const handleCreateBookingType = async (
//   req: Request<never, never, BookingTypeCreateOrUpdateSchemaType>,
//   res: Response,
// ) => {
//   try {
//     const newBookingType = await createBookingType(req.body);

//     return successResponse(
//       res,
//       'BookingType created successfully',
//       newBookingType,
//     );
//   } catch (err) {
//     return errorResponse(res, (err as Error).message);
//   }
// };

// export const handleUpdateBookingType = async (
//   req: Request<
//     BookingTypeIdSchemaType,
//     never,
//     BookingTypeCreateOrUpdateSchemaType
//   >,
//   res: Response,
// ) => {
//   try {
//     const udpatedBookingType = await updateBookingType(req.body, {
//       id: req.params.id,
//     });

//     return successResponse(
//       res,
//       'BookingType updated successfully',
//       udpatedBookingType,
//     );
//   } catch (err) {
//     return errorResponse(res, (err as Error).message);
//   }
// };

// export const handleDeleteBookingType = async (
//   req: Request<BookingTypeIdSchemaType, never, never>,
//   res: Response,
// ) => {
//   try {
//     await deleteBookingType(req.params.id);

//     return successResponse(res, 'BookingType deleted successfully');
//   } catch (err) {
//     return errorResponse(res, (err as Error).message);
//   }
// };
