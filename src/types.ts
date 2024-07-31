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
} from './apartment/apartment.model';
import { IApartmentBooking } from './apartment/apartment-booking/apartment-booking.model';
import { IApartmentBookingSummaryType } from './apartment/apartment-booking/apartment-booking.types';

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
export type ApartmentBookingsType = IApartmentBooking;
export type ApartmentBookingsSummaryType = IApartmentBookingSummaryType;
