import { CarBooking } from '../car-booking.model';
import {
  CarBookingSchemaType,
  CarBookingIdSchemaType,
} from './car-booking.schema';
import { JwtPayload } from '../../utils/auth.utils';
import { ICarBooking } from '../car-booking-types';
import { convertDistance, getDistance } from 'geolib';
import { Car } from '../car.model';

export const getCarBookings = async (): Promise<ICarBooking[]> => {
  const results = await CarBooking.find({});
  return results;
};

export const getCarBooking = async (
  carBookingId: CarBookingIdSchemaType,
): Promise<ICarBooking> => {
  const { id } = carBookingId;
  const result = await CarBooking.findOne({ _id: id });

  if (!result) {
    throw new Error('Car booking not found');
  }

  return result;
};

export const createCarBooking = async (
  body: CarBookingSchemaType,
  user: JwtPayload,
): Promise<ICarBooking> => {
  const totalMiles = convertDistance(
    getDistance(
      {
        latitude: body.from.coordinates[0],
        longitude: body.from.coordinates[1],
      },
      { latitude: body.to.coordinates[0], longitude: body.to.coordinates[1] },
    ),
    'mi',
  );

  const car = await Car.findOne({ _id: body.carId });

  if (!car) {
    throw new Error('Car not found');
  }

  const carBooking = await CarBooking.create({
    ...body,
    userId: user.sub,
    totalMiles: totalMiles,
    amount: car.perDayPrice,
  });

  return carBooking;
};

export const deleteCarBooking = async (
  carBookingId: CarBookingIdSchemaType,
): Promise<void | Error> => {
  const { id } = carBookingId;
  const deleted = await CarBooking.deleteOne({
    _id: id,
  });

  if (deleted.deletedCount < 1) {
    throw new Error('Car booking does not exist');
  }
};

export const deleteCarBookings = async (): Promise<void> => {
  await CarBooking.deleteMany({});
};
