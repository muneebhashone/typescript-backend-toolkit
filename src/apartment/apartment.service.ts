import {
  and,
  between,
  count,
  eq,
  ilike,
  inArray,
  or,
  sql,
  SQL,
} from 'drizzle-orm';
import { db } from '../drizzle/db';
import {
  apartments,
  cancellationPolicies,
  facilities,
} from '../drizzle/schema';
import { ApartmentType } from '../types';
import { JwtPayload } from '../utils/auth.utils';
import { getPaginator } from '../utils/getPaginator';
import {
  ApartmentCreateOrUpdateSchemaType,
  ApartmentIdSchemaType,
  ApartmentListQueryParamsType,
} from './apartment.schema';
import logger from '../lib/logger.service';

export const getApartments = async (
  query: ApartmentListQueryParamsType,
): Promise<any[]> => {
  let filter: SQL<unknown> | null = null;
  const andConditions: (SQL<unknown> | undefined)[] = [];

  if (query.search) {
    andConditions.push(
      or(
        ilike(apartments.name, `%${query.search}%`),
        ilike(apartments.description, `%${query.search}%`),
      ),
    );
  }
  if (query.rating) {
    const ratingComparison = sql`ROUND(CAST((total_rating::float / NULLIF(rating_count, 0)) AS numeric), 1) = ${query.rating}
    `;
    andConditions.push(ratingComparison);
  }
  if (query.maxPrice && query.minPrice) {
    andConditions.push(
      between(
        apartments.propertyPrice,
        String(query.minPrice),
        String(query.maxPrice),
      ),
    );
  }
  if (query.numberOfBathrooms) {
    andConditions.push(
      eq(apartments.numberOfBathrooms, query.numberOfBathrooms),
    );
  }
  if (query.numberOfBedrooms) {
    andConditions.push(eq(apartments.numberOfBedrooms, query.numberOfBedrooms));
  }

  filter = and(...andConditions) as SQL<unknown>;

  const totalRecords = await db
    .select({ count: count(apartments.id) })
    .from(apartments)
    .where(filter)
    .execute();

  const paginatorInfo = getPaginator(
    query.limit as number,
    query.page as number,
    totalRecords[0].count,
  );

  const results = await db.query.apartments.findMany({
    where: filter,
    limit: paginatorInfo.limit,
    offset: paginatorInfo.skip,
    with: {
      propertyType: true,
      typeOfPlace: true,
    },
  });

  return results;
};

export const createApartment = async (
  body: ApartmentCreateOrUpdateSchemaType,
  user: JwtPayload,
): Promise<ApartmentType | Error> => {
  const [apartment] = await db
    .insert(apartments)
    .values({ ...body, userId: Number(user.sub) })
    .returning()
    .execute();

  return apartment;
};

export const updateApartment = async (
  payload: ApartmentCreateOrUpdateSchemaType,
  user: JwtPayload,
  apartmentId: ApartmentIdSchemaType,
): Promise<ApartmentType> => {
  const { id } = apartmentId;

  const [updatedApartment] = await db
    .update(apartments)
    .set({ ...payload, userId: Number(user.sub) })
    .where(eq(apartments.id, id))
    .returning()
    .execute();

  return updatedApartment;
};

export const deleteApartment = async (apartmentId: number): Promise<void> => {
  const apartment = await db.query.apartments.findFirst({
    where: eq(apartments.id, apartmentId),
  });

  if (!apartment) {
    throw new Error('Apartment does not exists...');
  }

  await db.delete(apartments).where(eq(apartments.id, apartmentId));
};

export const deleteApartments = async (): Promise<void> => {
  await db.delete(apartments);
};
