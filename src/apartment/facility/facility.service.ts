import { Facility } from '../apartment.model';
import { FacilitiesType } from '../../types';
import {
  FacilityCreateOrUpdateSchemaType,
  FacilityIdSchemaType,
} from './facility.schema';

export const seedFacilities = async (): Promise<FacilitiesType[]> => {
  await Facility.deleteMany({});

  const data = [
    {
      name: 'Car Parking',
      icon: 'https://ik.imagekit.io/citylink/Facilities/Vertical%20container-1.svg?updatedAt=1722428053770',
    },
    {
      name: 'Swimming Pool',
      icon: 'https://ik.imagekit.io/citylink/Facilities/Vertical%20container.svg?updatedAt=1722428053781',
    },
    {
      name: 'Gym & Fitness',
      icon: 'https://ik.imagekit.io/citylink/Facilities/Button-1.svg?updatedAt=1722428053822',
    },
    {
      name: 'Restaurant',
      icon: 'https://ik.imagekit.io/citylink/Facilities/Button-2.svg?updatedAt=1722428053746',
    },
    {
      name: 'Laundry',
      icon: 'https://ik.imagekit.io/citylink/Facilities/Button.svg?updatedAt=1722428053751',
    },
    {
      name: 'Kitchen',
      icon: 'https://ik.imagekit.io/citylink/Facilities/kitchen%20(1)%201.svg?updatedAt=1722428053719',
    },
    {
      name: 'Standby Elevator ',
      icon: 'https://ik.imagekit.io/citylink/Facilities/elevator%201.svg?updatedAt=1722428053718',
    },
    {
      name: 'Security Camera',
      icon: 'https://ik.imagekit.io/citylink/Facilities/security-camera%20(1)%201.svg?updatedAt=1722428053814',
    },
    {
      name: 'Extinguisher',
      icon: 'https://ik.imagekit.io/citylink/Facilities/extinguisher.svg?updatedAt=1722425345998',
    },
    {
      name: 'First Aid Kit',
      icon: 'https://ik.imagekit.io/citylink/Facilities/first-aid-kit.svg?updatedAt=1722425345964',
    },
    {
      name: 'Smoke Detector',
      icon: 'https://ik.imagekit.io/citylink/Facilities/smoke-detector.svg?updatedAt=1722425346006',
    },
    {
      name: 'Bon Fire',
      icon: 'https://ik.imagekit.io/citylink/Facilities/bonfire.svg?updatedAt=1722425345871',
    },
    {
      name: 'Beach',
      icon: 'https://ik.imagekit.io/citylink/Facilities/beach.svg?updatedAt=1722425345832',
    },
    {
      name: 'Barbecue',
      icon: 'https://ik.imagekit.io/citylink/Facilities/barbecue.svg?updatedAt=1722425346005',
    },
    {
      name: 'Billard',
      icon: 'https://ik.imagekit.io/citylink/Facilities/billiard.svg?updatedAt=1722425346006',
    },
    {
      name: 'Vaccum Cleaner',
      icon: 'https://ik.imagekit.io/citylink/Facilities/vacuum-cleaner.svg?updatedAt=1722425345928',
    },
    {
      name: 'Monitor',
      icon: 'https://ik.imagekit.io/citylink/Facilities/monitor.svg?updatedAt=1722425345834',
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

export const deleteAllFacilities = async (): Promise<void> => {
  await Facility.deleteMany({});
};

deleteAllFacilities;
