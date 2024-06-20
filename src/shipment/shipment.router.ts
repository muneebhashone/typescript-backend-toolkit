import express from 'express';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleCreateShipment,
  handleDeleteBulkShipments,
  handleDeleteShipment,
  handleGetAllShipments,
  handleGetShipmentById,
  handleGetShipmentByTrackingNumber,
} from './shipment.controller';
import {
  bulkShipmentIdsSchema,
  createShipment,
  getAllShipmentsSchema,
  getShipmentByIdSchema,
  getShipmentByTrackingNumberSchema,
} from './shipment.schema';
import { canAccess } from '../middlewares/can-access.middleware';

export const SHIPMENT_ROUTER_ROOT = '/shipments';

const shipmentRouter = express.Router();

shipmentRouter.get(
  '/',
  canAccess(),
  validateZodSchema({ query: getAllShipmentsSchema }),
  handleGetAllShipments,
);

shipmentRouter.delete(
  '/:shipmentId',
  canAccess('permissions', ['DELETE_SHIPMENT']),
  validateZodSchema({ params: getShipmentByIdSchema }),
  handleDeleteShipment,
);

shipmentRouter.delete(
  '/bulk',
  canAccess('permissions', ['DELETE_SHIPMENT']),
  validateZodSchema({ query: bulkShipmentIdsSchema }),
  handleDeleteBulkShipments,
);

shipmentRouter.get(
  '/:trackingNumber/trackingNo',
  canAccess(),
  validateZodSchema({ params: getShipmentByTrackingNumberSchema }),
  handleGetShipmentByTrackingNumber,
);

shipmentRouter.get(
  '/:shipmentId/id',
  canAccess(),
  validateZodSchema({ params: getShipmentByIdSchema }),
  handleGetShipmentById,
);

shipmentRouter.post(
  '/',
  canAccess(),
  validateZodSchema({ body: createShipment }),
  handleCreateShipment,
);

export default shipmentRouter;
