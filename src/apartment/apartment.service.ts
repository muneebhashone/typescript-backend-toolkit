import { inArray } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { Apartment } from '../models/apartment';
import { ApartmentType } from '../types';
import { JwtPayload } from '../utils/auth.utils';
import {
  ApartmentCreateOrUpdateSchemaType,
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
  ]);

  const fetchUsersPromise = db.query.users.findMany({
    where: inArray(
      users.id,
      Array.from(new Set(results.map((result) => Number(result.userId)))),
    ),
  });

  const fetchBusinessesPromise = db.query.businesses.findMany({
    where: inArray(
      businesses.id,
      Array.from(new Set(results.map((result) => Number(result.businessId)))),
    ),
  });

  const [fetchUsers, fetchBusinesses] = await Promise.all([
    fetchUsersPromise,
    fetchBusinessesPromise,
  ]);

  const mappedResults = results.map((result) => {
    return {
      ...result.toObject(),
      user: fetchUsers.find(
        (user) => Number(user.id) === Number(result.userId),
      ),
      business: fetchBusinesses.find(
        (business) => Number(business.id) === Number(result.businessId),
      ),
    };
  });

  return mappedResults;
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
