import { FilterQuery } from 'mongoose';
import { ApartmentType } from '../types';
import { JwtPayload } from '../utils/auth.utils';
import { getPaginator, GetPaginatorReturnType } from '../utils/getPaginator';
import { Apartment } from './apartment.model';
import {
  ApartmentCreateOrUpdateSchemaType,
  ApartmentIdSchemaType,
  ApartmentListQueryParamsType,
} from './apartment.schema';

export interface IGetApartment {
  results: ApartmentType[];
  paginator: GetPaginatorReturnType;
}

export const getApartments = async (
  query: ApartmentListQueryParamsType,
): Promise<IGetApartment> => {
  const filter: FilterQuery<ApartmentType> = { $or: [], $and: [] };

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.rating) {
    filter.$expr = {
      $eq: [
        {
          $round: [
            { $divide: ['$total_rating', { $ifNull: ['$rating_count', 1] }] },
            1,
          ],
        },
        query.rating,
      ],
    };
  }

  if (query.minPrice) {
    filter.propertyPrice = {
      $gte: query.minPrice,
    };
  }

  if (query.maxPrice) {
    if (filter.propertyPrice) {
      filter.propertyPrice = {
        ...filter.propropertyPrice,
        $lte: query.maxPrice,
      };
    } else {
      filter.propertyPrice = {
        $lte: query.maxPrice,
      };
    }
  }

  if (query.numberOfBathrooms) {
    filter.numberOfBathrooms = query.numberOfBathrooms;
  }

  if (query.numberOfBedrooms) {
    filter.numberOfBedrooms = query.numberOfBedrooms;
  }

  const total = await Apartment.countDocuments(filter);

  const paginator = getPaginator(query.limit ?? 10, query.page ?? 1, total);

  const results = await Apartment.find(filter)
    .skip(paginator.skip)
    .limit(paginator.limit)
    .populate([
      'propertyType',
      'typeOfPlace',
      'cancellationPolicies',
      'facilities',
      'houseRules',
      'discounts',
      'bookingType',
    ]);

  return {
    results,
    paginator,
  };
};

export const getApartment = async (
  apartmentId: ApartmentIdSchemaType,
): Promise<ApartmentType> => {
  const { id } = apartmentId;
  const result = await Apartment.findOne({ _id: id }).populate([
    'propertyType',
    'typeOfPlace',
    'cancellationPolicies',
    'facilities',
    'houseRules',
    'discounts',
    'bookingType',
  ]);

  if (!result) {
    throw new Error('Apartment not found');
  }

  return result;
};

export const createApartment = async (
  body: ApartmentCreateOrUpdateSchemaType,
  user: JwtPayload,
): Promise<ApartmentType> => {
  const apartment = await Apartment.create({
    ...body,
    userId: user.sub,
  });

  return apartment;
};

export const updateApartment = async (
  apartmentId: ApartmentIdSchemaType,
  body: ApartmentCreateOrUpdateSchemaType,
): Promise<ApartmentType | Error> => {
  const { id } = apartmentId;
  const apartment = await Apartment.findByIdAndUpdate(
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

  if (!apartment) {
    throw new Error('Apartment does not exist');
  }

  return apartment;
};

export const deleteApartment = async (
  apartmentId: ApartmentIdSchemaType,
): Promise<void | Error> => {
  const { id } = apartmentId;
  const deleted = await Apartment.deleteOne({
    _id: id,
  });

  if (deleted.deletedCount < 1) {
    throw new Error('Apartment does not Exist');
  }
};

export const deleteApartments = async (): Promise<void> => {
  await Apartment.deleteMany({});
};
