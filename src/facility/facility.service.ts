import { Facility } from '../models/apartment';
import { FacilitiesType } from '../types';
import {
  FacilityCreateOrUpdateSchemaType,
  FacilityIdSchemaType,
} from './facility.schema';

export const seedFacilities = async (): Promise<FacilitiesType[]> => {
  await Facility.deleteMany({});

  const data = [
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

  const insertedData = await Facility.insertMany(data);

  return insertedData;
};

export const getFacility = async (): Promise<FacilitiesType[]> => {
  const facility = await Facility.find({});

  return facility;
};

export const createFacility = async (
  body: FacilityCreateOrUpdateSchemaType,
): Promise<FacilitiesType | Error> => {
  const newFacility = await Facility.create({ ...body });
  return newFacility;
};

export const updateFacility = async (
  payload: FacilityCreateOrUpdateSchemaType,
  facilityId: FacilityIdSchemaType,
): Promise<FacilitiesType> => {
  const { id } = facilityId;
  const facility = await Facility.findByIdAndUpdate(
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

  if (!facility) {
    throw new Error('Facility not found');
  }

  return facility;
};

export const deleteFacility = async (
  facilityId: FacilityIdSchemaType,
): Promise<void> => {
  const { id } = facilityId;
  const deleted = await Facility.deleteOne({ _id: id });
  if (deleted.deletedCount < 1) {
    throw new Error('Facility does not Exist');
  }
};
