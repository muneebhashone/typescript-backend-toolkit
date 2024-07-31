import { Car } from '../car.model';
import { CarType } from '../../types';
import { JwtPayload } from '../../utils/auth.utils';
import {
  CarCreateSchemaType,
  CarUpdateSchemaType,
  CarIdSchemaType,
  CarListQueryParamsType,
} from './car-listing.schema';

export const getCars = async (
  _: CarListQueryParamsType,
): Promise<CarType[]> => {
  const results = await Car.find({});

  return results;
};

export const getCar = async (carId: CarIdSchemaType): Promise<CarType> => {
  const { id } = carId;
  const result = await Car.findOne({ _id: id });

  if (!result) {
    throw new Error('Car not found');
  }

  return result;
};

export const createCar = async (
  body: CarCreateSchemaType,
  user: JwtPayload,
): Promise<CarType> => {
  const car = await Car.create({
    ...body,
    userId: user.sub,
  });

  return car;
};

export const updateCar = async (
  carId: CarIdSchemaType,
  body: CarUpdateSchemaType,
): Promise<CarType | Error> => {
  const { id } = carId;
  const car = await Car.findByIdAndUpdate(
    id,
    {
      $set: {
        ...body,
      },
    },
    {
      new: true,
    },
  );

  if (!car) {
    throw new Error('Car does not exist');
  }

  return car;
};

export const deleteCar = async (
  carId: CarIdSchemaType,
): Promise<void | Error> => {
  const { id } = carId;
  const deleted = await Car.deleteOne({
    _id: id,
  });

  if (deleted.deletedCount < 1) {
    throw new Error('Car does not exist');
  }
};

export const deleteCars = async (): Promise<void> => {
  await Car.deleteMany({});
};
