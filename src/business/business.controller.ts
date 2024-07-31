import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import {
  createBusiness,
  deleteBusiness,
  getBusiness,
  seedBusinesses,
  updateBusiness,
} from './business.service';
import {
  BusinessCreateOrUpdateSchemaType,
  BusinessIdSchemaType,
} from './business.schema';

export const handleGetBusinesses = async (_: Request, res: Response) => {
  try {
    const result = await getBusiness();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleSeedBusinesses = async (_: Request, res: Response) => {
  try {
    const result = await seedBusinesses();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateBusiness = async (
  req: Request<never, never, BusinessCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const newBusiness = await createBusiness(req.body.name);

    return successResponse(res, 'Business created successfully', newBusiness);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateBusiness = async (
  req: Request<BusinessIdSchemaType, never, BusinessCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const udpatedBusiness = await updateBusiness(
      { name: req.body.name },
      { id: String(req.params.id) },
    );

    return successResponse(
      res,
      'Business updated successfully',
      udpatedBusiness,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteBusiness = async (
  req: Request<BusinessIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    await deleteBusiness({ id: req.params.id });

    return successResponse(res, 'Business deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
