import { FilterQuery } from 'mongoose';
import { ApartmentType } from '../types';
import { UserIdSchemaType } from '../user/user.schema';
import { JwtPayload } from '../utils/auth.utils';
import { checkRecordForEmptyArrays } from '../utils/common.utils';
import { getPaginator, GetPaginatorReturnType } from '../utils/getPaginator';
import { Apartment, IApartment } from './apartment.model';
import {
  ApartmentCreateOrUpdateSchemaType,
  ApartmentIdSchemaType,
  ApartmentListQueryParamsType,
  TakeABreakSchemaType,
} from './apartment.schema';
import { addNotificationJob } from '../queues/notification.queue';
import {
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TITLE,
} from '../notification/notification.constants';

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
export const getMyApartments = async (
  userId: UserIdSchemaType,
): Promise<IApartment[]> => {
  const result = await Apartment.find({
    owner: userId.id,
  }).populate([
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
    owner: user.sub,
  });

  await addNotificationJob({
    title: NOTIFICATION_TITLE.NEW_LISTING,
    message: NOTIFICATION_MESSAGES.NEW_LISTING,
    notificationType: 'SYSTEM_NOTIFICATION',
    businessType: 'apartment',
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
  userId: UserIdSchemaType,
): Promise<void | Error> => {
  const { id } = apartmentId;

  const apartment = await Apartment.findById(id);

  if (!apartment) {
    throw new Error('Apartment does not Exist');
  } else if (apartment?.owner?.toString() !== userId.id.toString()) {
    throw new Error('You do not have permission to delete this apartment.');
  } else {
    apartment.deleteOne();
  }
};

export const deleteApartments = async (): Promise<void> => {
  await Apartment.deleteMany({});
};

export const takeABreakForApartment = async (payload: TakeABreakSchemaType) => {
  const apartment = await Apartment.findByIdAndUpdate(payload.apartmentId, {
    $set: {
      isOnBreak: true,
      reasonForBreak: payload.reason,
      breakFrom: payload.from,
      breakTill: payload.till,
    },
  });

  if (!apartment) {
    throw new Error('Apartment not found or invalid token');
  }
};
