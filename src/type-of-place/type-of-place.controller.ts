import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import {
  createTypeOfPlace,
  deleteTypeOfPlace,
  getTypeOfPlace,
  seedTypesOfPlace,
  updateTypeOfPlace,
} from './type-of-place.service';
import {
  TypeOfPlaceCreateOrUpdateSchemaType,
  TypeOfPlaceIdSchemaType,
} from './type-of-place.schema';

export const handleSeedTypesOfPlace = async (_: Request, res: Response) => {
  try {
    const result = await seedTypesOfPlace();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetTypesOfPlace = async (_: Request, res: Response) => {
  try {
    const result = await getTypeOfPlace();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateTypeOfPlace = async (
  req: Request<never, never, TypeOfPlaceCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const newTypeOfPlace = await createTypeOfPlace(req.body);

    return successResponse(
      res,
      'TypeOfPlace created successfully',
      newTypeOfPlace,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateTypeOfPlace = async (
  req: Request<
    TypeOfPlaceIdSchemaType,
    never,
    TypeOfPlaceCreateOrUpdateSchemaType
  >,
  res: Response,
) => {
  try {
    const udpatedTypeOfPlace = await updateTypeOfPlace(req.body, {
      id: req.params.id,
    });

    return successResponse(
      res,
      'TypeOfPlace updated successfully',
      udpatedTypeOfPlace,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteTypeOfPlace = async (
  req: Request<TypeOfPlaceIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    await deleteTypeOfPlace(req.params.id);

    return successResponse(res, 'TypeOfPlace deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
