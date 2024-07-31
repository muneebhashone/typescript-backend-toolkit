import { IApartment } from '../apartment.model';

export interface IApartmentBookingSummaryType {
  period: {
    checkIn: Date;
    checkOut: Date;
  };
  paymentDetail: {
    totalDays: number;
    totalPrice: number;
    discountAmount: number;
    tax: number;
    sumTotal: number;
  };
  apartment: Partial<IApartment> | null;
}
