export interface ICreateShipment {
  trackingNumber: string;
  carrier: string;
  companyId: number;
  creatorId: number;
}
export interface IResponse {
  message: string;
  status: string;
}
