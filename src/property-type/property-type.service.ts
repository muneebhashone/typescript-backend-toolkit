import { InferInsertModel, eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { propertyTypes } from '../drizzle/schema';
import { PropertyTypesType } from '../types';
import {
  PropertyTypeCreateOrUpdateSchemaType,
  PropertyTypeIdSchemaType,
} from './property-type.schema';

export const seedPropertyTypes = async (): Promise<PropertyTypesType[]> => {
  await db.delete(propertyTypes).execute();

  const propertyTypesData: InferInsertModel<typeof propertyTypes>[] = [
    {
      type: 'Apartment',
    },
    {
      type: 'House',
    },
    {
      type: 'Condo',
    },
    {
      type: 'Townhouse',
    },
    {
      type: 'Villa',
    },
    {
      type: 'Loft',
    },
    {
      type: 'Studio',
    },
    {
      type: 'Penthouse',
    },
    {
      type: 'Duplex',
    },
    {
      type: 'Triplex',
    },
  ];

  const insertedData = await db
    .insert(propertyTypes)
    .values(propertyTypesData)
    .returning()
    .execute();

  return insertedData;
};

export const getPropertyType = async (): Promise<PropertyTypesType[]> => {
  const propertyType = await db.query.propertyTypes.findMany();

  return propertyType;
};

export const createPropertyType = async (
  body: PropertyTypeCreateOrUpdateSchemaType,
): Promise<PropertyTypesType | Error> => {
  try {
    const newPropertyType = await db
      .insert(propertyTypes)
      .values({ ...body })
      .returning()
      .execute();

    return newPropertyType[0];
  } catch (_) {
    return new Error('Error creating property type');
  }
};

export const updatePropertyType = async (
  payload: PropertyTypeCreateOrUpdateSchemaType,
  propertyTypeId: PropertyTypeIdSchemaType,
): Promise<PropertyTypesType> => {
  const { id } = propertyTypeId;
  const propertyType = await db.query.propertyTypes.findFirst({
    where: eq(propertyTypes.id, id),
  });

  if (!propertyType) {
    throw new Error('Property type not found');
  }

  const updatedPropertyType = await db
    .update(propertyTypes)
    .set({ ...payload })
    .where(eq(propertyTypes.id, id))
    .returning()
    .execute();

  return updatedPropertyType[0];
};

export const deletePropertyType = async (
  propertyTypeId: number,
): Promise<void> => {
  await db.delete(propertyTypes).where(eq(propertyTypes.id, propertyTypeId));
};
