import { InferInsertModel, eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { apartments } from '../drizzle/schema';
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
  try {
    const newApartment = await db
      .insert(apartments)
      .values({ ...body })
      .returning()
      .execute();

    return newApartment[0];
  } catch (error: any) {
    return new Error(error?.message);
  }
};

export const updateApartment = async (
  payload: ApartmentCreateOrUpdateSchemaType,
  apartmentId: ApartmentIdSchemaType,
): Promise<ApartmentType> => {
  const { id } = apartmentId;
  const apartment = await db.query.apartments.findFirst({
    where: eq(apartments.id, id),
  });

  if (!apartment) {
    throw new Error('Apartment not found');
  }

  const updatedApartment = await db
    .update(apartments)
    .set({ ...payload })
    .where(eq(apartments.id, id))
    .returning()
    .execute();

  return updatedApartment[0];
};

export const deleteApartment = async (apartmentId: number): Promise<void> => {
  await db.delete(apartments).where(eq(apartments.id, apartmentId));
};
