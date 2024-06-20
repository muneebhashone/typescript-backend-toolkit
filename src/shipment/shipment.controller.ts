import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../drizzle/db';
import { users } from '../drizzle/schema';
import { NotFoundError } from '../errors/errors.service';
import { errorResponse, successResponse } from '../utils/api.utils';
import { JwtPayload } from '../utils/auth.utils';
import {
  BulkShipmentIdsSchemaType,
  CreateShipmentType,
  GetAllShipmentsType,
  GetShipmentByIdParams,
  GetShipmentByTrackingNumberParams,
} from './shipment.schema';
import {
  createShipment,
  deleteBulkShipments,
  deleteShipment,
  getShipmentById,
  getShipmentByTrackingNumber,
  getShipments,
} from './shipment.service';

export const handleDeleteShipment = async (
  req: Request<GetShipmentByIdParams, never>,
  res: Response,
) => {
  try {
    await deleteShipment(req.params.shipmentId);

    return successResponse(res, 'Shipment has been deleted');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteBulkShipments = async (
  req: Request<never, never, never, BulkShipmentIdsSchemaType>,
  res: Response,
) => {
  try {
    await deleteBulkShipments(req.query.ids);

    return successResponse(res, 'Shipments are deleted');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetShipmentById = async (
  req: Request<GetShipmentByIdParams, never>,
  res: Response,
) => {
  try {
    const shipmentId = req.params.shipmentId;
    const shipment = await getShipmentById(shipmentId);

    return res.json({ result: shipment });
  } catch (err) {
    return errorResponse(res, (err as Error).message, StatusCodes.NOT_FOUND);
  }
};

export const handleCreateShipment = async (
  req: Request<never, never, CreateShipmentType>,
  res: Response,
) => {
  try {
    const shipment = await createShipment(req.body, req.user);

    return successResponse(res, 'Shipment is queued', shipment);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetAllShipments = async (
  req: Request<never, never, never, GetAllShipmentsType>,
  res: Response,
) => {
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, Number((req.user as JwtPayload).sub)),
  });

  const { results, paginatorInfo } = await getShipments({
    ...req.query,
    creatorId: currentUser?.id,
    companyId: currentUser?.companyId,
  });

  return res.json({
    results,
    paginatorInfo,
  });
};

export const handleGetShipmentByTrackingNumber = async (
  req: Request<GetShipmentByTrackingNumberParams, never, never, never>,
  res: Response,
) => {
  try {
    const currentUser = req.user as JwtPayload;
    const shipment = await getShipmentByTrackingNumber(
      req.params.trackingNumber,
      Number(currentUser.sub),
    );
    return res.json({ data: shipment });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return errorResponse(res, err.message, StatusCodes.NOT_FOUND);
    }

    return errorResponse(
      res,
      (err as Error).message,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
