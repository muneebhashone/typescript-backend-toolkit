import validator from 'validator';
import z from 'zod';
import { searchAndPaginationSchema } from '../lib/common.schemas';

export const apartmentIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isAlphanumeric(value), 'ID must be valid')
    .transform(Number),
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
  video_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().max(255),
  city: z.string().max(100),
  state: z.string().max(100),
  zipCode: z.string().max(20),
  country: z.string().max(100),
  propertyPrice: z.number().positive().nonnegative().transform(String),
  numberOfRooms: z.number().int().positive().nonnegative(),
  numberOfBathrooms: z.number().int().positive().nonnegative(),
  numberOfBedrooms: z.number().int().positive().nonnegative(),
  numberOfPets: z.number().int().positive().nonnegative(),
  numberOfPersonsAllowed: z.number().int().positive().nonnegative(),
  petHosting: z.number().positive().nonnegative().transform(String),
  areaInSqft: z.number().int().positive().nonnegative(),
  bookingTypeId: z.number().int().positive().nonnegative(),
  businessId: z.number().int().positive().nonnegative(),
  discountId: z.number().int().positive().nonnegative().nullable().optional(),
  propertyTypes: z
    .number()
    .int()
    .positive()
    .nonnegative()
    .nullable()
    .optional(),
  typeOfPlace: z.number().int().positive().nonnegative().nullable().optional(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
  cancellationPolicies: z.array(z.number()).min(1),
  facilities: z.array(z.number()).min(1),
  totalRating: z.number().positive().nonnegative().optional(),
  ratingCount: z.number().positive().nonnegative().optional(),
});

export type ApartmentIdSchemaType = z.infer<typeof apartmentIdSchema>;
export type ApartmentCreateOrUpdateSchemaType = z.infer<
  typeof apartmentCreateOrUpdateSchema
>;
export type ApartmentListQueryParamsType = z.infer<
  typeof apartmentListQueryParamsSchema
>;
