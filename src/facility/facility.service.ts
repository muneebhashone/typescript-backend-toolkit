import { Facility } from '../models/apartment';
import { FacilitiesType } from '../types';

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

// export const createFacility = async (
//   body: FacilityCreateOrUpdateSchemaType,
// ): Promise<FacilitiesType | Error> => {
//   try {
//     const newFacility = await db
//       .insert(facilities)
//       .values({ ...body })
//       .returning()
//       .execute();

//     return newFacility[0];
//   } catch (_) {
//     return new Error('Error creating facility');
//   }
// };

// export const updateFacility = async (
//   payload: FacilityCreateOrUpdateSchemaType,
//   facilityId: FacilityIdSchemaType,
// ): Promise<FacilitiesType> => {
//   const { id } = facilityId;
//   const facility = await db.query.facilities.findFirst({
//     where: eq(facilities.id, id),
//   });

//   if (!facility) {
//     throw new Error('Facility not found');
//   }

//   const updatedFacility = await db
//     .update(facilities)
//     .set({ ...payload })
//     .where(eq(facilities.id, id))
//     .returning()
//     .execute();

//   return updatedFacility[0];
// };

// export const deleteFacility = async (facilityId: number): Promise<void> => {
//   await db.delete(facilities).where(eq(facilities.id, facilityId));
// };
