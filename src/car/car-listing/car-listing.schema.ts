import validator from 'validator';
import z from 'zod';
import { searchAndPaginationSchema } from '../../lib/common.schemas';
import {
  TypesOfVehicle,
  CarSubCategory,
  CarFacilities,
  CarCancellationPolicies,
  CarTransmissions,
  CarDiscounts,
} from '../car-types';

export const carIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isAlphanumeric(value), 'ID must be valid'),
});

export const carListQueryParamsSchema = z
  .object({
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    transmission: z
      .enum(Object.keys(CarTransmissions) as [keyof typeof CarTransmissions])
      .optional(),
    facilities: z
      .array(z.enum(Object.keys(CarFacilities) as [keyof typeof CarFacilities]))
      .optional(),
    typeOfVehicle: z
      .enum(Object.keys(TypesOfVehicle) as [keyof typeof TypesOfVehicle])
      .optional(),
  })
  .merge(searchAndPaginationSchema);

export const carCreateSchema = z.object({
  name: z.string().max(255),
  coverPhoto: z.string().nullable().optional(),
  video: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  make: z.string().max(255),
  model: z.string().max(255),
  noOfSeats: z.number().int().nonnegative(),
  noOfLuggage: z.number().int().nonnegative(),
  transmission: z.enum(
    Object.keys(CarTransmissions) as [keyof typeof CarTransmissions],
  ),
  perDayPrice: z.number().nonnegative().transform(String),
  location: z.object({
    country: z.string().max(100),
    state: z.string().max(100),
    city: z.string().max(100),
    street: z.string().max(255),
    postalCode: z.string().max(20),
  }),
  subCategory: z.enum(
    Object.keys(CarSubCategory) as [keyof typeof CarSubCategory],
  ),
  chauffeurDetails: z.object({
    name: z.string().max(255),
    phoneNumber: z
      .string()
      .refine(
        (value) => validator.isMobilePhone(value),
        'Phone number must be valid',
      ),
    perDayPrice: z.number().nonnegative().transform(String),
  }),
  facilities: z
    .array(z.enum(Object.keys(CarFacilities) as [keyof typeof CarFacilities]))
    .min(1),
  discounts: z
    .array(z.enum(Object.keys(CarDiscounts) as [keyof typeof CarDiscounts]))
    .min(1)
    .optional(),
  cancellationPolicies: z
    .array(
      z.enum(
        Object.keys(CarCancellationPolicies) as [
          keyof typeof CarCancellationPolicies,
        ],
      ),
    )
    .min(1)
    .optional(),
});

export const carUpdateSchema = carCreateSchema
  .extend({ underReview: z.boolean() })
  .partial();

export type CarIdSchemaType = z.infer<typeof carIdSchema>;
export type CarCreateSchemaType = z.infer<typeof carCreateSchema>;
export type CarUpdateSchemaType = z.infer<typeof carUpdateSchema>;
export type CarListQueryParamsType = z.infer<typeof carListQueryParamsSchema>;
