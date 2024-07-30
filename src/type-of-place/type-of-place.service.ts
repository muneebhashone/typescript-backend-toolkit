import { InferInsertModel, eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { typeOfPlace } from '../drizzle/schema';
import { TypesOfPlaceType } from '../types';
import {
  TypeOfPlaceCreateOrUpdateSchemaType,
  TypeOfPlaceIdSchemaType,
} from './type-of-place.schema';

export const seedTypesOfPlace = async (): Promise<TypesOfPlaceType[]> => {
  await db.delete(typeOfPlace).execute();

  const typesOfPlaceData: InferInsertModel<typeof typeOfPlace>[] = [
    {
      type: 'Entire Place',
    },
    {
      type: 'Private Room',
    },
    {
      type: 'Shared Room',
    },
    {
      type: 'Guest Suite',
    },
    {
      type: 'Guesthouse',
    },
    {
      type: 'Serviced Apartment',
    },
    {
      type: 'Bungalow',
    },
    {
      type: 'Cabin',
    },
    {
      type: 'Chalet',
    },
    {
      type: 'Cottage',
    },
  ];

  const insertedData = await db
    .insert(typeOfPlace)
    .values(typesOfPlaceData)
    .returning()
    .execute();

  return insertedData;
};

export const getTypeOfPlace = async (): Promise<TypesOfPlaceType[]> => {
  const typeOfPlace = await db.query.typeOfPlace.findMany();

  return typeOfPlace;
};

export const createTypeOfPlace = async (
  body: TypeOfPlaceCreateOrUpdateSchemaType,
): Promise<TypesOfPlaceType | Error> => {
  try {
    const newTypeOfPlace = await db
      .insert(typeOfPlace)
      .values({ ...body })
      .returning()
      .execute();

    return newTypeOfPlace[0];
  } catch (_) {
    return new Error('Error creating type of place');
  }
};

export const updateTypeOfPlace = async (
  payload: TypeOfPlaceCreateOrUpdateSchemaType,
  typeOfPlaceId: TypeOfPlaceIdSchemaType,
): Promise<TypesOfPlaceType> => {
  const { id } = typeOfPlaceId;
  const typeOfPlaceData = await db.query.typeOfPlace.findFirst({
    where: eq(typeOfPlace.id, id),
  });

  if (!typeOfPlaceData) {
    throw new Error('Type of place not found');
  }

  const updatedTypeOfPlace = await db
    .update(typeOfPlace)
    .set({ ...payload })
    .where(eq(typeOfPlace.id, id))
    .returning()
    .execute();

  return updatedTypeOfPlace[0];
};

export const deleteTypeOfPlace = async (
  typeOfPlaceId: number,
): Promise<void> => {
  await db.delete(typeOfPlace).where(eq(typeOfPlace.id, typeOfPlaceId));
};
