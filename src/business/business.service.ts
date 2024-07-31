import Business from '../models/business';
import { BusinessType } from '../types'; // Define your type structure for TypeScript compatibility
import { BusinessIdSchemaType } from './business.schema';

// Get all businesses
export const getBusiness = async (): Promise<BusinessType[]> => {
  const businesses = await Business.find().lean().exec();
  return businesses;
};

// Create a new business
export const createBusiness = async (name: string): Promise<BusinessType> => {
  // Check if the business already exists
  const exist = await Business.findOne({ name });

  if (exist) {
    throw new Error('Business already exists with the same name');
  }

  // Create a new business
  const newBusiness = new Business({ name });
  await newBusiness.save();
  return newBusiness.toObject();
};

export const updateBusiness = async (
  payload: { name?: string; thumbnail?: string },
  businessId: BusinessIdSchemaType,
): Promise<BusinessType> => {
  const business = await Business.findById({ _id: businessId.id });

  if (!business) {
    throw new Error('Business not found');
  }

  if (payload.name) business.name = payload.name;
  if (payload.thumbnail) business.thumbnail = payload.thumbnail;

  await business.save();
  return business.toObject();
};

export const deleteBusiness = async (
  businessId: BusinessIdSchemaType,
): Promise<void> => {
  await Business.findByIdAndDelete({ _id: businessId.id });
};

// Seed initial business data
export const seedBusinesses = async (): Promise<BusinessType[]> => {
  await Business.deleteMany(); // Clear all existing documents

  const businessesData: BusinessType[] = [
    {
      name: 'Appartment Booking',
      thumbnail:
        'https://city-link.s3.us-east-2.amazonaws.com/direct-uploads/business-4.png',
    },
    {
      name: 'Boat Booking',
      thumbnail:
        'https://city-link.s3.us-east-2.amazonaws.com/direct-uploads/business-3.png',
    },
    {
      name: 'Executive Car Booking',
      thumbnail:
        'https://city-link.s3.us-east-2.amazonaws.com/direct-uploads/business-2.png',
    },
    {
      name: 'Jet & Helicopter Booking',
      thumbnail:
        'https://city-link.s3.us-east-2.amazonaws.com/direct-uploads/business-1.png',
    },
  ];

  const insertedData = await Business.insertMany(businessesData);
  return insertedData;
};
