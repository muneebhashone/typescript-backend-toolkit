import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import {
  createDiscount,
  deleteDiscount,
  getDiscount,
  seedDiscounts,
  updateDiscount,
} from './discount.service';
import {
  DiscountCreateOrUpdateSchemaType,
  DiscountIdSchemaType,
} from './discount.schema';

export const handleSeedDiscounts = async (_: Request, res: Response) => {
  try {
    const result = await seedDiscounts();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetDiscounts = async (_: Request, res: Response) => {
  try {
    const result = await getDiscount();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateDiscount = async (
  req: Request<never, never, DiscountCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const newDiscount = await createDiscount(req.body);

    return successResponse(res, 'Discount created successfully', newDiscount);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateDiscount = async (
  req: Request<DiscountIdSchemaType, never, DiscountCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const udpatedDiscount = await updateDiscount(req.body, {
      id: req.params.id,
    });

    return successResponse(
      res,
      'Discount updated successfully',
      udpatedDiscount,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteDiscount = async (
  req: Request<DiscountIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    await deleteDiscount({ id: req.params.id });

    return successResponse(res, 'Discount deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
