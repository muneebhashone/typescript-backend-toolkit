import { PropertyType } from '../apartment.model';
import { PropertyTypesType } from '../../types';
import {
  PropertyTypeCreateOrUpdateSchemaType,
  PropertyTypeIdSchemaType,
} from './property-type.schema';

export const seedPropertyTypes = async (): Promise<PropertyTypesType[]> => {
  await PropertyType.deleteMany({});

  const data = [
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

  const insertedData = await PropertyType.insertMany(data);

  return insertedData;
};

export const getPropertyType = async (): Promise<PropertyTypesType[]> => {
  const propertyType = await PropertyType.find({});

  return propertyType;
};

export const createPropertyType = async (
  body: PropertyTypeCreateOrUpdateSchemaType,
): Promise<PropertyTypesType | Error> => {
  const newPropertyType = await PropertyType.create({ ...body });
  return newPropertyType;
};

export const updatePropertyType = async (
  payload: PropertyTypeCreateOrUpdateSchemaType,
  propertyTypeId: PropertyTypeIdSchemaType,
): Promise<PropertyTypesType> => {
  const { id } = propertyTypeId;
  const propertyType = await PropertyType.findByIdAndUpdate(
    id,
    {
      $set: {
        ...payload,
      },
    },
    {
      new: true,
    },
  );

  if (!propertyType) {
    throw new Error('PropertyType not found');
  }

  return propertyType;
};

export const deletePropertyType = async (
  propertyTypeId: PropertyTypeIdSchemaType,
): Promise<void> => {
  const { id } = propertyTypeId;
  const deleted = await PropertyType.deleteOne({ _id: id });
  if (deleted.deletedCount < 1) {
    throw new Error('PropertyType does not Exist');
  }
};
