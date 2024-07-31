import { BookingType } from '../apartment.model';
import { BookingTypesType } from '../../types';
import {
  BookingTypeCreateOrUpdateSchemaType,
  BookingTypeIdSchemaType,
} from './bookingType.schema';

export const seedBookingTypes = async (): Promise<BookingTypesType[]> => {
  await BookingType.deleteMany({});

  const data = [
    {
      name: 'Daily',
      description: 'Daily Booking Type',
    },
    {
      name: 'Weekly',
      description: 'Weekly Booking Type',
    },
    {
      name: 'Monthly',
      description: 'Monthly Type',
    },
    {
      name: 'Yearly',
      description: 'Yearly Type',
    },
  ];

  const insertedData = await BookingType.insertMany(data);

  return insertedData;
};

export const getBookingType = async (): Promise<BookingTypesType[]> => {
  const cancellationPolicy = await BookingType.find({});

  return cancellationPolicy;
};

export const createBookingType = async (
  body: BookingTypeCreateOrUpdateSchemaType,
): Promise<BookingTypesType | Error> => {
  const newBookingType = await BookingType.create({
    ...body,
  });

  return newBookingType;
};

export const updateBookingType = async (
  payload: BookingTypeCreateOrUpdateSchemaType,
  bookingTypeId: BookingTypeIdSchemaType,
): Promise<BookingTypesType> => {
  const { id } = bookingTypeId;
  const bookingType = await BookingType.findByIdAndUpdate(
    id,
    {
      $set: {
        ...payload,
      },
    },
    {
      new: true,
    },
  );

  if (!bookingType) {
    throw new Error('BookingType not found');
  }

  return bookingType;
};

export const deleteBookingType = async (
  bookingTypeId: BookingTypeIdSchemaType,
): Promise<void> => {
  const { id } = bookingTypeId;
  const deleted = await BookingType.deleteOne({ _id: id });
  if (deleted.deletedCount < 1) {
    throw new Error('Booking Type does not Exist');
  }
};
