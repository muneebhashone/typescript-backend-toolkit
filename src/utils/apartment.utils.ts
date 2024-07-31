import dayjs from 'dayjs';
import { ApartmentBookingsType, ApartmentType, DiscountsType } from '../types';

const TAX_PERCENTAGE = 10;

export const getApartmentBookingPaymentDetails = (
  booking: ApartmentBookingsType,
  apartment: Partial<ApartmentType>,
  discount: DiscountsType,
) => {
  const checkIn = dayjs(booking.checkIn);
  const checkOut = dayjs(booking.checkOut);

  const diff = checkIn.diff(checkOut);
  let totalDays = diff.valueOf();
  if (totalDays < 1) {
    totalDays = 1;
  }
  const totalPrice = totalDays * Number(apartment.propertyPrice!.toString());
  const discountAmount = (Number(discount?.value) / 100) * totalPrice;
  const tax = (TAX_PERCENTAGE / 100) * totalPrice;
  const sumTotal = totalPrice - discountAmount + tax;

  return {
    totalDays,
    totalPrice,
    discountAmount,
    tax,
    sumTotal,
  };
};
