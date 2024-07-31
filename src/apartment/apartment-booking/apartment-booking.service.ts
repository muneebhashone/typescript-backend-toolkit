import { ReturnMessageSchema } from '../../lib/common.schema';
import { Apartment, Discount } from '../apartment.model';
import { ApartmentBooking } from './apartment-booking.model';
import {
  ApartmentBookingsSummaryType,
  ApartmentBookingsType,
} from '../../types';
import { getApartmentBookingPaymentDetails } from '../../utils/apartment.utils';
import {
  ApartmentBookingCreateOrUpdateSchemaType,
  ApartmentBookingIdSchemaType,
  ConfirmApartmentBookingSchema,
} from './apartment-booking.schema';

export const getApartmentBooking = async (): Promise<
  ApartmentBookingsType[]
> => {
  const apartmentBooking = await ApartmentBooking.find({});

  return apartmentBooking;
};

export const createApartmentBooking = async (
  body: ConfirmApartmentBookingSchema,
): Promise<ReturnMessageSchema | Error> => {
  const apartmentBookingConfirmed = await ApartmentBooking.findByIdAndUpdate(
    body.id,
    {
      $set: {
        confirmed: true,
        termsAccepted: body.termsAccepted,
      },
    },
    {
      new: true,
    },
  );

  if (apartmentBookingConfirmed) {
    return {
      status: 200,
      message: 'Apartment Successfully Booked',
    };
  }

  return {
    status: 400,
    message: 'Apartment Booking Failed',
  };
};

export const deleteApartmentBooking = async (
  apartmentBookingId: ApartmentBookingIdSchemaType,
): Promise<void> => {
  const { id } = apartmentBookingId;
  const deleted = await ApartmentBooking.deleteOne({ _id: id });
  if (deleted.deletedCount < 1) {
    throw new Error('ApartmentBooking does not Exist');
  }
};

export const getApartmentBookingSummary = async (
  payload: ApartmentBookingCreateOrUpdateSchemaType,
): Promise<ApartmentBookingsSummaryType> => {
  const apartment = await Apartment.findById(payload.apartment).select(
    'name address propertyPrice coverPhotoUrl ratingCount totalRating userId',
  );

  if (!apartment)
    throw new Error('Apartment selected for booking does not exist');

  const discount = await Discount.findById(payload.discount);

  if (!discount)
    throw new Error('Discount selected for booking does not exist');

  const booking = await ApartmentBooking.create({
    ...payload,
    confirmed: false,
    apartmentOwner: apartment.userId,
  });

  const bookingDetails = getApartmentBookingPaymentDetails(
    booking,
    apartment,
    discount,
  );

  return {
    period: {
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    },
    paymentDetail: bookingDetails,
    apartment,
  };
};
