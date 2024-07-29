import { and, avg, between, count, eq, ilike, or, sql, SQL } from 'drizzle-orm';
import { db } from '../drizzle/db';
import {
  apartmentCancellationPolicies,
  apartmentFacilities,
  apartments,
} from '../drizzle/schema';
import { ApartmentType } from '../types';
import {
  ApartmentCreateOrUpdateSchemaType,
  ApartmentIdSchemaType,
  ApartmentListQueryParamsType,
} from './apartment.schema';
import { JwtPayload } from '../utils/auth.utils';
import _ from 'lodash';
import { getPaginator } from '../utils/getPaginator';

export const getApartment = async (
  query: ApartmentListQueryParamsType,
): Promise<ApartmentType[]> => {
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
  });

  return results;
};

export const createApartment = async (
  body: ApartmentCreateOrUpdateSchemaType,
  user: JwtPayload,
): Promise<ApartmentType | Error> => {
  const { cancellationPolicies, facilities, ...apartmentDataWithoutRelations } =
    body;

  try {
    const apartment = await db.transaction(async (tx) => {
      const [apartment] = await tx
        .insert(apartments)
        .values({ ...apartmentDataWithoutRelations, userId: Number(user.sub) })
        .returning()
        .execute();

      const cancellationPoliciesData = cancellationPolicies.map((policyId) => ({
        apartmentId: apartment.id,
        cancellationPolicyId: policyId,
      }));
      await tx
        .insert(apartmentCancellationPolicies)
        .values(cancellationPoliciesData)
        .execute();

      const facilitiesData = facilities.map((facilityId) => ({
        apartmentId: apartment.id,
        facilityId: facilityId,
      }));
      await tx.insert(apartmentFacilities).values(facilitiesData).execute();

      return apartment;
    });

    return apartment;
  } catch (error) {
    console.error('Error creating apartment:', error);
    throw new Error('Apartment creation failed, rolled back.');
  }
};

export const updateApartment = async (
  payload: ApartmentCreateOrUpdateSchemaType,
  user: JwtPayload,
  apartmentId: ApartmentIdSchemaType,
): Promise<ApartmentType> => {
  const { id } = apartmentId;
  const { cancellationPolicies, facilities, ...apartmentDataWithoutRelations } =
    payload;

  try {
    const apartment = await db.transaction(async (tx) => {
      const [updatedApartment] = await tx
        .update(apartments)
        .set({ ...apartmentDataWithoutRelations, userId: Number(user.sub) })
        .where(eq(apartments.id, id))
        .returning()
        .execute();

      if (cancellationPolicies) {
        await tx
          .delete(apartmentCancellationPolicies)
          .where(eq(apartmentCancellationPolicies.apartmentId, id))
          .execute();

        const cancellationPoliciesData = cancellationPolicies.map(
          (policyId) => ({
            apartmentId: id,
            cancellationPolicyId: policyId,
          }),
        );
        await tx
          .insert(apartmentCancellationPolicies)
          .values(cancellationPoliciesData)
          .execute();
      }

      if (facilities) {
        await tx
          .delete(apartmentFacilities)
          .where(eq(apartmentFacilities.apartmentId, id))
          .execute();

        const facilitiesData = facilities.map((facilityId) => ({
          apartmentId: id,
          facilityId: facilityId,
        }));
        await tx.insert(apartmentFacilities).values(facilitiesData).execute();
      }

      return updatedApartment;
    });

    return apartment;
  } catch (error) {
    console.error('Error updating apartment:', error);
    throw new Error('Apartment Updation failed, rolled back.');
  }
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
