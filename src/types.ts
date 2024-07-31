import { InferSelectModel } from 'drizzle-orm';
import { businesses, users } from './drizzle/schema';
import {
  IApartment,
  IBookingType,
  ICancellationPolicy,
  IDiscount,
  IFacility,
  IHouseRule,
  IPropertyType,
  ITypeOfPlace,
} from './models/apartment';
import { ICar } from './car/car-types';

export type UserType = InferSelectModel<typeof users>;
export type BusinessType = InferSelectModel<typeof businesses>;
export type ApartmentType = IApartment;
export type BookingTypesType = IBookingType;
export type CancellationPoliciesType = ICancellationPolicy;
export type FacilitiesType = IFacility;
export type HouseRulesType = IHouseRule;
export type DiscountsType = IDiscount;
export type PropertyTypesType = IPropertyType;
export type TypesOfPlaceType = ITypeOfPlace;
export type CarType = ICar;
