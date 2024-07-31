import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import {
  createApartment,
  deleteApartment,
  deleteApartments,
  getApartment,
  getApartments,
  updateApartment,
} from './apartment.service';
import {
  ApartmentCreateOrUpdateSchemaType,
  ApartmentIdSchemaType,
} from './apartment.schema';

export const handleGetApartments = async (req: Request, res: Response) => {
  try {
    const result = await getApartments(req.query);

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateApartment = async (
  req: Request<never, never, ApartmentCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const newApartment = await createApartment(req.body, req.user);

    return successResponse(res, 'Apartment created successfully', newApartment);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateApartment = async (
  req: Request<ApartmentIdSchemaType, never, ApartmentCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const updatedApartment = await updateApartment(
      {
        id: req.params.id,
      },
      req.body,
    );

    if (updatedApartment) {
      return successResponse(
        res,
        'Apartment updated successfully',
        updatedApartment,
      );
    }
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetApartment = async (req: Request, res: Response) => {
  try {
    const result = await getApartment({id: req.params.id});

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteApartment = async (
  req: Request<ApartmentIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    await deleteApartment({ id: req.params.id });

    return successResponse(res, 'Apartment deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteApartments = async (
  req: Request<ApartmentIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    await deleteApartments();

    return successResponse(res, 'Apartments deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
