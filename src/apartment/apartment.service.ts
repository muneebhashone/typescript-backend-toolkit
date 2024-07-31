import { inArray } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { Apartment } from '../models/apartment';
import { ApartmentType } from '../types';
import { JwtPayload } from '../utils/auth.utils';
import {
  ApartmentCreateOrUpdateSchemaType,
  ApartmentIdSchemaType,
  ApartmentListQueryParamsType,
} from './apartment.schema';
import { businesses, users } from '../drizzle/schema';

export const getApartments = async (
  _: ApartmentListQueryParamsType,
): Promise<ApartmentType[]> => {
  const results = await Apartment.find({}).populate([
    'propertyType',
    'typeOfPlace',
    'cancellationPolicies',
    'facilities',
    'houseRules',
    'discounts',
    'bookingType',
  ]);

  return results;
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
    userId: Number(user.sub),
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
