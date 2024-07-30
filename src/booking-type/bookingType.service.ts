import { BookingType } from '../models/apartment';
import { BookingTypesType } from '../types';

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

// export const createBookingType = async (
//   body: BookingTypeCreateOrUpdateSchemaType,
// ): Promise<BookingTypesType | Error> => {
//   try {
//     const newBookingType = await db
//       .insert(bookingTypes)
//       .values({ ...body })
//       .returning()
//       .execute();

//     return newBookingType[0];
//   } catch (_) {
//     return new Error('Error creating booking type');
//   }
// };

// export const updateBookingType = async (
//   payload: BookingTypeCreateOrUpdateSchemaType,
//   bookingTypeId: BookingTypeIdSchemaType,
// ): Promise<BookingTypesType> => {
//   const { id } = bookingTypeId;
//   const bookingType = await db.query.bookingTypes.findFirst({
//     where: eq(bookingTypes.id, id),
//   });

//   if (!bookingType) {
//     throw new Error('BookingType not found');
//   }

//   const updatedBookingType = await db
//     .update(bookingTypes)
//     .set({ ...payload })
//     .where(eq(bookingTypes.id, id))
//     .returning()
//     .execute();

//   return updatedBookingType[0];
// };

// export const deleteBookingType = async (
//   bookingTypeId: number,
// ): Promise<void> => {
//   await db.delete(bookingTypes).where(eq(bookingTypes.id, bookingTypeId));
// };
