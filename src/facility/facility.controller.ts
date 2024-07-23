import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import {
  createFacility,
  deleteFacility,
  getFacility,
  seedFacilities,
  updateFacility,
} from './facility.service';
import {
  FacilityCreateOrUpdateSchemaType,
  FacilityIdSchemaType,
} from './facility.schema';

export const handleSeedFacilities = async (_: Request, res: Response) => {
  try {
    const result = await seedFacilities();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetFacilities = async (_: Request, res: Response) => {
  try {
    const result = await getFacility();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateFacility = async (
  req: Request<never, never, FacilityCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const newFacility = await createFacility(req.body);

    return successResponse(res, 'Facility created successfully', newFacility);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateFacility = async (
  req: Request<FacilityIdSchemaType, never, FacilityCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const udpatedFacility = await updateFacility(req.body, {
      id: req.params.id,
    });

    return successResponse(
      res,
      'Facility updated successfully',
      udpatedFacility,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteFacility = async (
  req: Request<FacilityIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    await deleteFacility(req.params.id);

    return successResponse(res, 'Facility deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
