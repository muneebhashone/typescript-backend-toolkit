import { FilterQuery } from 'mongoose';
import { CarType } from '../../types';
import { JwtPayload } from '../../utils/auth.utils';
import { checkRecordForEmptyArrays } from '../../utils/common.utils';
import { getPaginator, GetPaginatorReturnType } from '../../utils/getPaginator';
import { ICar } from '../car-types';
import { Car } from '../car.model';
import cars from '../../json/cars.json';
import {
  CarCreateSchemaType,
  CarIdSchemaType,
  CarListQueryParamsType,
  CarUpdateSchemaType,
} from './car-listing.schema';

export interface IGetCars {
  results: CarType[];
  paginator: GetPaginatorReturnType;
}

export const getCars = async (
  query: CarListQueryParamsType,
): Promise<IGetCars> => {
  const filterQuery: FilterQuery<ICar> = { $or: [], $and: [] };

  if (query.search) {
    filterQuery.$or?.push({ name: { $regex: query.search, $options: 'i' } });
    filterQuery.$or?.push({ brand: { $regex: query.search, $options: 'i' } });
    filterQuery.$or?.push({ model: { $regex: query.search, $options: 'i' } });
  }

  if (query.maxPrice) {
    filterQuery.$and?.push({ perDayPrice: { $lte: query.maxPrice } });
  }

  if (query.minPrice) {
    filterQuery.$and?.push({ perDayPrice: { $gte: query.minPrice } });
  }

  if (query.numberOfSeats) {
    filterQuery.$and?.push({ noOfSeats: query.numberOfSeats });
  }

  if (query.make) {
    filterQuery.$and?.push({ make: query.make });
  }

  if (query.model) {
    filterQuery.$and?.push({ model: query.model });
  }

  if (query.transmission) {
    filterQuery.$and?.push({ transmission: query.transmission });
  }

  if (query.subCategory) {
    filterQuery.$and?.push({ subCategory: query.subCategory });
  }

  if (query.typeOfVehicle) {
    filterQuery.$and?.push({ typeOfVehicle: query.typeOfVehicle });
  }

  if (query.facilities && query.facilities.length) {
    filterQuery.$and?.push({ facilities: { $all: query.facilities } });
  }

  if (query.rating) {
    filterQuery.$and?.push({ rating: { $lte: query.rating } });
  }

  const total = await Car.countDocuments(
    checkRecordForEmptyArrays(filterQuery),
  );

  const paginator = getPaginator(query.limit ?? 10, query.page ?? 1, total);

  const results = await Car.find(checkRecordForEmptyArrays(filterQuery))
    .skip(paginator.skip)
    .limit(paginator.limit);

  return {
    results: results,
    paginator: paginator,
  };
};

export const getCarMakes = () => {
  return cars.map((car) => car.title);
};

export const getCarModelsByMake = (make: string) => {
  return (cars.find((car) => car.title === make)?.models ?? []).map(
    (model) => model.title,
  );
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
