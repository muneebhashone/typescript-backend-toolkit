import { ICreateShipment } from '../shipment/types';

export type GetTrackingPayload = ICreateShipment;

export abstract class APIAdaptor {
  abstract checkTracking(shipmentId: number): unknown;
}
