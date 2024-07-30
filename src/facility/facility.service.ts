import { InferInsertModel, eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { facilities } from '../drizzle/schema';
import { FacilitiesType } from '../types';
import {
  FacilityCreateOrUpdateSchemaType,
  FacilityIdSchemaType,
} from './facility.schema';

export const seedFacilities = async (): Promise<FacilitiesType[]> => {
  await db.delete(facilities).execute();

  const facilitiesData: InferInsertModel<typeof facilities>[] = [
    {
      name: 'Car Parking',
    },
    {
      name: 'Swimming Pool',
    },
    {
      name: 'Gym & Fitness',
    },
    {
      name: 'Restaurant',
    },
    {
      name: 'Laundry',
    },
    {
      name: 'Kitchen',
    },
    {
      name: 'Standby Elevator ',
    },
    {
      name: 'Security Camera',
    },
  ];

  const insertedData = await db
    .insert(facilities)
    .values(facilitiesData)
    .returning()
    .execute();

  return insertedData;
};

export const getFacility = async (): Promise<FacilitiesType[]> => {
  const facility = await db.query.facilities.findMany();

  return facility;
};

export const createFacility = async (
  body: FacilityCreateOrUpdateSchemaType,
): Promise<FacilitiesType | Error> => {
  try {
    const newFacility = await db
      .insert(facilities)
      .values({ ...body })
      .returning()
      .execute();

    return newFacility[0];
  } catch (_) {
    return new Error('Error creating facility');
  }
};

export const updateFacility = async (
  payload: FacilityCreateOrUpdateSchemaType,
  facilityId: FacilityIdSchemaType,
): Promise<FacilitiesType> => {
  const { id } = facilityId;
  const facility = await db.query.facilities.findFirst({
    where: eq(facilities.id, id),
  });

  if (!facility) {
    throw new Error('Facility not found');
  }

  const updatedFacility = await db
    .update(facilities)
    .set({ ...payload })
    .where(eq(facilities.id, id))
    .returning()
    .execute();

  return updatedFacility[0];
};

export const deleteFacility = async (facilityId: number): Promise<void> => {
  await db.delete(facilities).where(eq(facilities.id, facilityId));
};
