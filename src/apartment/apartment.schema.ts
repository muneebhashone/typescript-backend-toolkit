import validator from 'validator';
import z from 'zod';
import { searchAndPaginationSchema } from '../lib/common.schema';

export const apartmentIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isMongoId(value), 'ID must be valid'),
});

export const apartmentListQueryParamsSchema = z
  .object({
    rating: z.string().transform(Number).optional(),
    numberOfBedrooms: z.string().transform(Number).optional(),
    numberOfBathrooms: z.string().transform(Number).optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
  })
  .merge(searchAndPaginationSchema);

export const apartmentCreateOrUpdateSchema = z.object({
  name: z.string().max(255),
  coverPhotoUrl: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().max(255),
  city: z.string().max(100),
  state: z.string().max(100),
  zipCode: z.string().max(20),
  country: z.string().max(100),
  checkIn: z.string().time(),
  checkOut: z.string().time(),
  propertyPrice: z.number().nonnegative().transform(String),
  numberOfRooms: z.number().int().nonnegative(),
  numberOfBathrooms: z.number().int().nonnegative(),
  numberOfBedrooms: z.number().int().nonnegative(),
  numberOfPets: z.number().int().nonnegative(),
  numberOfPersonsAllowed: z.number().int().nonnegative(),
  petHosting: z.number().nonnegative().transform(String),
  propertySize: z.number().int().nonnegative(),
  propertySizeUnit: z.string().max(100),
  bookingType: z.string().min(1),
  businessId: z.string().refine((value) => validator.isMongoId(value)),
  propertyType: z.string().min(1),
  typeOfPlace: z.string().min(1),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
  cancellationPolicies: z.array(z.string().min(1)).min(1),
  facilities: z.array(z.string().min(1)).min(1),
  houseRules: z.array(z.string().min(1)).min(1),
  discounts: z.array(z.string().min(1)).min(1),
  totalRating: z.number().nonnegative().optional(),
  ratingCount: z.number().nonnegative().optional(),
});

export type ApartmentIdSchemaType = z.infer<typeof apartmentIdSchema>;
export type ApartmentCreateOrUpdateSchemaType = z.infer<
  typeof apartmentCreateOrUpdateSchema
>;
export type ApartmentListQueryParamsType = z.infer<
  typeof apartmentListQueryParamsSchema
>;
