import { TypeOfPlace } from '../../apartment/apartment.model';
import { TypesOfPlaceType } from '../../types';
import {
  TypeOfPlaceCreateOrUpdateSchemaType,
  TypeOfPlaceIdSchemaType,
} from './type-of-place.schema';

export const seedTypesOfPlace = async (): Promise<TypesOfPlaceType[]> => {
  await TypeOfPlace.deleteMany({});

  const data = [
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

  const insertedData = await TypeOfPlace.insertMany(data);

  return insertedData;
};

export const getTypeOfPlace = async (): Promise<TypesOfPlaceType[]> => {
  const typeOfPlace = await TypeOfPlace.find({});

  return typeOfPlace;
};

export const createTypeOfPlace = async (
  body: TypeOfPlaceCreateOrUpdateSchemaType,
): Promise<TypesOfPlaceType | Error> => {
  const newTypeOfPlace = await TypeOfPlace.create({ ...body });
  return newTypeOfPlace;
};

export const updateTypeOfPlace = async (
  payload: TypeOfPlaceCreateOrUpdateSchemaType,
  typeOfPlaceId: TypeOfPlaceIdSchemaType,
): Promise<TypesOfPlaceType> => {
  const { id } = typeOfPlaceId;
  const typeOfPlace = await TypeOfPlace.findByIdAndUpdate(
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

  if (!typeOfPlace) {
    throw new Error('TypeOfPlace not found');
  }

  return typeOfPlace;
};

export const deleteTypeOfPlace = async (
  typeOfPlaceId: TypeOfPlaceIdSchemaType,
): Promise<void> => {
  const { id } = typeOfPlaceId;
  const deleted = await TypeOfPlace.deleteOne({ _id: id });
  if (deleted.deletedCount < 1) {
    throw new Error('TypeOfPlace does not Exist');
  }
};
