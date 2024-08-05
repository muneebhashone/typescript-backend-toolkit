import { StatusCodes } from 'http-status-codes';
import { ReturnMessageSchemaType } from '../../lib/common.schema';
import {
  ApartmentBookingsSummaryType,
  ApartmentBookingsType,
  BookingPaymentStatus,
  BookingStatus,
} from '../../types';
import { getApartmentBookingPaymentDetails } from '../../utils/apartment.utils';
import { JwtPayload } from '../../utils/auth.utils';
import { Apartment, Discount } from '../apartment.model';
import { ApartmentBooking } from './apartment-booking.model';
import {
  ApartmentBookingCreateOrUpdateSchemaType,
  ApartmentBookingIdSchemaType,
  ConfirmApartmentBookingSchema,
  MyApartmentBookingsSchema,
} from './apartment-booking.schema';
import { addNotificationJob } from '../../queues/notification.queue';
import {
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TITLE,
} from '../../notification/notification.constants';

export const getApartmentBooking = async (): Promise<
  ApartmentBookingsType[]
> => {
  const apartmentBooking = await ApartmentBooking.find({});

  return apartmentBooking;
};

export const getMyApartmentBooking = async (
  payload: MyApartmentBookingsSchema,
  user: JwtPayload,
): Promise<ApartmentBookingsType[]> => {
  const { status } = payload;
  const filter: MyApartmentBookingsSchema & { user?: string } = {};
  if (status) {
    filter.status = status;
  }

  filter.user = user.sub;

  const myBookings = await ApartmentBooking.find(filter);
  // .populate('apartment discount');

  return myBookings;
};

export const confirmApartmentBooking = async (
  body: ConfirmApartmentBookingSchema,
): Promise<ReturnMessageSchemaType | Error> => {
  const apartmentBookingConfirmed = await ApartmentBooking.findByIdAndUpdate(
    body.id,
    {
      $set: {
        confirmed: true,
        termsAccepted: body.termsAccepted,
        status: 'completed',
        paymentStatus: 'paid',
      },
    },
    {
      new: true,
    },
  );

  if (!apartmentBookingConfirmed) {
    throw new Error('Apartment Booking Failed');
  }

  await addNotificationJob({
    title: NOTIFICATION_TITLE.YOUR_PURCHASE_IS_DONE,
    message: NOTIFICATION_MESSAGES.YOUR_PURCHASE_IS_DONE,
    notificationType: 'SYSTEM_NOTIFICATION',
    businessType: 'apartment',
    bookingId: apartmentBookingConfirmed.id,
  });

  return {
    status: 200,
    message: 'Apartment Successfully Booked',
  };

  // return {
  //   status: 400,
  //   message: 'Apartment Booking Failed',
  // };
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

export const refundApartmentBooking = async (
  apartmentBookingId: ApartmentBookingIdSchemaType,
): Promise<ReturnMessageSchemaType> => {
  const { id } = apartmentBookingId;
  const booking = await ApartmentBooking.findOne({ _id: id });
  if (booking?.status !== BookingStatus.cancelled) {
    throw new Error('Please cancel the booking first!');
  }
  const updatedBooking = await ApartmentBooking.findOneAndUpdate(
    { _id: id, status: BookingStatus.cancelled },
    {
      $set: {
        paymentStatus: BookingPaymentStatus.refunded,
      },
    },
    { new: true },
  );

  if (!updatedBooking) {
    throw new Error('Booking Refund failed or not found');
  }

  return {
    status: StatusCodes.OK,
    message: 'Payment Refunded',
  };
};
export const cancelApartmentBooking = async (
  apartmentBookingId: ApartmentBookingIdSchemaType,
): Promise<ReturnMessageSchemaType> => {
  const { id } = apartmentBookingId;
  const updatedBooking = await ApartmentBooking.findByIdAndUpdate(
    id,
    {
      $set: {
        status: BookingStatus.cancelled,
      },
    },
    { new: true },
  );

  if (!updatedBooking) {
    return {
      status: StatusCodes.BAD_REQUEST,
      message: 'Booking Cancellation failed or not found',
    };
  }

  return {
    status: StatusCodes.OK,
    message: 'Booking Cancelled',
  };
};

export const createApartmentBookingSummary = async (
  payload: ApartmentBookingCreateOrUpdateSchemaType,
  user: JwtPayload,
): Promise<ApartmentBookingsType> => {
  const apartment = await Apartment.findById(payload.apartment).select(
    'name address propertyPrice coverPhotoUrl ratingCount totalRating owner',
  );

  if (!apartment)
    throw new Error('Apartment selected for booking does not exist');

  const discount = await Discount.findById(payload.discount);

  if (!discount)
    throw new Error('Discount selected for booking does not exist');

  console.log({ apartment, discount });

  const booking = await ApartmentBooking.create({
    ...payload,
    confirmed: false,
    apartmentOwner: apartment.owner,
    status: 'pending',
    paymentStatus: 'unpaid',
    user: user.sub,
  });

  return booking;
};

export const getApartmentBookingSummary = async (
  bookingId: ApartmentBookingIdSchemaType,
): Promise<ApartmentBookingsSummaryType> => {
  const { id } = bookingId;
  const booking = await ApartmentBooking.findById(id);

  if (!booking) throw new Error('Booking Does not exist');

  const apartment = await Apartment.findById(booking.apartment);

  if (!apartment)
    throw new Error('Apartment selected for booking does not exist');

  const discount = await Discount.findById(booking.discount);

  if (!discount)
    throw new Error('Discount selected for booking does not exist');

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
