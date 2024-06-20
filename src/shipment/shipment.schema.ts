import * as z from 'zod';
import { trackWithEnums } from '../drizzle/enums';

export const getShipmentByTrackingNumberSchema = z.object({
  trackingNumber: z
    .string({ required_error: 'Tracking number is required' })
    .transform((value) => value.toUpperCase()),
});

export const getShipmentByIdSchema = z.object({
  shipmentId: z
    .string({ required_error: 'Shipment id is required' })
    .min(1)
    .transform(Number),
});

export const bulkShipmentIdsSchema = z.object({
  ids: z
    .string()
    .array()
    .refine(
      (values) => values.every((value) => !isNaN(Number(value))),
      'Ids must be string-integer',
    )
    .transform((values) => values.map(Number)),
});

export const getAllShipmentsSchema = z.object({
  searchString: z.string().default(''),
  limitParam: z.string().default('10').transform(Number),
  pageParam: z.string().default('1').transform(Number),
});

export const createShipment = z.object({
  trackWith: z.enum(trackWithEnums),
  containerNo: z
    .string()
    .nullable()
    .transform((value) => (value ? value.toUpperCase() : null)),
  mblNo: z
    .string()
    .nullable()
    .transform((value) => (value ? value.toUpperCase() : null)),
  carrier: z.string(),
  tags: z.string().array(),
  followers: z.string().email().array(),
  referenceNo: z.string().nullable(),
});

export type GetAllShipmentsType = z.infer<typeof getAllShipmentsSchema>;

export type CreateShipmentType = z.infer<typeof createShipment>;

export type GetShipmentByTrackingNumberParams = z.infer<
  typeof getShipmentByTrackingNumberSchema
>;

export type GetShipmentByIdParams = z.infer<typeof getShipmentByIdSchema>;
export type BulkShipmentIdsSchemaType = z.infer<typeof bulkShipmentIdsSchema>;
