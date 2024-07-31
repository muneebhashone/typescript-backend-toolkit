import mongoose from 'mongoose';
import {
  TypesOfVehicle,
  CarSubCategory,
  CarFacilities,
  CarCancellationPolicies,
  CarTransmissions,
  CarDiscounts,
  TypesOfVehicleUnion,
  CarTransmissionsUnion,
  CarDiscountsUnion,
  CarCancellationPoliciesUnion,
  CarFacilitiesUnion,
  CarSubCategoryUnion,
  ICarLocation,
  ICarChauffeur,
  ICar,
} from '../car/car-types';

// Schema for CarLocation
const CarLocationSchema = new mongoose.Schema<ICarLocation>({
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true },
});

// Schema for CarService
const CarChauffeurSchema = new mongoose.Schema<ICarChauffeur>({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  perDayPrice: { type: Number, required: true },
});

// Schema for Car
const CarSchema = new mongoose.Schema<ICar>(
  {
    name: { type: String, required: true },
    typeOfVehicle: {
      type: String,
      enum: Object.keys(TypesOfVehicle) as TypesOfVehicleUnion[],
      required: true,
    },
    userId: { type: String, required: true },
    underReview: { type: Boolean, default: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    noOfSeats: { type: Number, required: true },
    noOfLuggage: { type: Number, required: true },
    transmission: {
      type: String,
      enum: Object.keys(CarTransmissions) as CarTransmissionsUnion[],
      required: true,
    },
    subCategory: {
      type: String,
      enum: Object.keys(CarSubCategory) as CarSubCategoryUnion[],
      required: true,
    },
    perDayPrice: { type: Number, required: true },
    description: { type: String, required: true },
    location: { type: CarLocationSchema, required: true },
    chauffeurDetails: { type: CarChauffeurSchema, required: true },
    facilities: [
      {
        type: String,
        enum: Object.keys(CarFacilities) as CarFacilitiesUnion[],
        required: true,
      },
    ],
    coverPhoto: { type: String, required: true },
    photos: [{ type: String, required: true }],
    video: { type: String },
    discounts: [
      {
        type: String,
        enum: Object.keys(CarDiscounts) as CarDiscountsUnion[],
      },
    ],
    cancellationPolicies: [
      {
        type: String,
        enum: Object.keys(
          CarCancellationPolicies,
        ) as CarCancellationPoliciesUnion[],
      },
    ],
  },
  { timestamps: true },
);

// Create and export Mongoose models
export const CarLocation = mongoose.model<ICarLocation>(
  'CarLocation',
  CarLocationSchema,
);
export const CarChauffeur = mongoose.model<ICarChauffeur>(
  'CarChauffeur',
  CarChauffeurSchema,
);
export const Car = mongoose.model<ICar>('Car', CarSchema);
