import { FilterQuery } from 'mongoose';
import { ApartmentType } from '../types';
import { JwtPayload } from '../utils/auth.utils';
import { checkRecordForEmptyArrays } from '../utils/common.utils';
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
  const filterQuery: FilterQuery<ApartmentType> = { $or: [], $and: [] };

  if (query.search) {
    filterQuery.$or?.push({ name: { $regex: query.search, $options: 'i' } });
    filterQuery.$or?.push({
      description: { $regex: query.search, $options: 'i' },
    });
  }

  if (query.rating) {
    filterQuery.$and?.push({
      $expr: {
        $eq: [
          {
            $round: [
              { $divide: ['$total_rating', { $ifNull: ['$rating_count', 1] }] },
              1,
            ],
          },
          query.rating,
        ],
      },
    });
  }

  if (query.maxPrice) {
    filterQuery.$and?.push({ propertyPrice: { $lte: query.maxPrice } });
  }

  if (query.minPrice) {
    filterQuery.$and?.push({ propertyPrice: { $gte: query.minPrice } });
  }

  if (query.numberOfBathrooms) {
    filterQuery.$and?.push({
      numberOfBathrooms: { $gte: query.numberOfBathrooms },
    });
  }

  if (query.numberOfBedrooms) {
    filterQuery.$and?.push({
      numberOfBedrooms: { $gte: query.numberOfBedrooms },
    });
  }

  const total = await Apartment.countDocuments(
    checkRecordForEmptyArrays(filterQuery),
  );

  const paginator = getPaginator(query.limit ?? 10, query.page ?? 1, total);

  const results = await Apartment.find(checkRecordForEmptyArrays(filterQuery))
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
