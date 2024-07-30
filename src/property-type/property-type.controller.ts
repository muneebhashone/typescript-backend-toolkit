import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import {
  createPropertyType,
  deletePropertyType,
  getPropertyType,
  seedPropertyTypes,
  updatePropertyType,
} from './property-type.service';
import {
  PropertyTypeCreateOrUpdateSchemaType,
  PropertyTypeIdSchemaType,
} from './property-type.schema';

export const handleSeedPropertyTypes = async (_: Request, res: Response) => {
  try {
    const result = await seedPropertyTypes();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetPropertyTypes = async (_: Request, res: Response) => {
  try {
    const result = await getPropertyType();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreatePropertyType = async (
  req: Request<never, never, PropertyTypeCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const newPropertyType = await createPropertyType(req.body);

    return successResponse(
      res,
      'PropertyType created successfully',
      newPropertyType,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdatePropertyType = async (
  req: Request<
    PropertyTypeIdSchemaType,
    never,
    PropertyTypeCreateOrUpdateSchemaType
  >,
  res: Response,
) => {
  try {
    const udpatedPropertyType = await updatePropertyType(req.body, {
      id: req.params.id,
    });

    return successResponse(
      res,
      'PropertyType updated successfully',
      udpatedPropertyType,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeletePropertyType = async (
  req: Request<PropertyTypeIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    await deletePropertyType(req.params.id);

    return successResponse(res, 'PropertyType deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
