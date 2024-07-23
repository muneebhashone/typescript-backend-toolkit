import { eq } from 'drizzle-orm';
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
} from './apartment.schema';

export const getApartment = async (): Promise<ApartmentType[]> => {
  const apartment = await db.query.apartments.findMany();

  return apartment;
};

export const createApartment = async (
  body: ApartmentCreateOrUpdateSchemaType,
): Promise<ApartmentType | Error> => {
  const { cancellationPolicies, facilities, ...apartmentDataWithoutRelations } =
    body;

  try {
    const apartment = await db.transaction(async (tx) => {
      const [apartment] = await tx
        .insert(apartments)
        .values(apartmentDataWithoutRelations)
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
  apartmentId: ApartmentIdSchemaType,
): Promise<ApartmentType> => {
  const { id } = apartmentId;
  const { cancellationPolicies, facilities, ...apartmentDataWithoutRelations } =
    payload;

  try {
    const apartment = await db.transaction(async (tx) => {
      const [updatedApartment] = await tx
        .update(apartments)
        .set(apartmentDataWithoutRelations)
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
