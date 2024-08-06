import { IApartmentBooking } from './apartment/apartment-booking/apartment-booking.model';
import { IApartmentBookingSummaryType } from './apartment/apartment-booking/apartment-booking.types';
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
import { ICar } from './car/car-types';
import { IBusiness } from './models/business';
import { IUser } from './models/users';

export type UserType = IUser & { _id?: string };
export type BusinessType = IBusiness;
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
export type CarType = ICar;

export const BookingStatus = {
  completed: 'completed',
  pending: 'pending',
  cancelled: 'cancelled',
} as const;

export const BookingPaymentStatus = {
  paid: 'paid',
  unpaid: 'unpaid',
  refunded: 'refunded',
} as const;

export const BusinessTypes = {
  apartment: 'apartment',
  car: 'car',
  jet: 'jet',
  boat: 'boat',
} as const;

export type BusinessTypesUnion = keyof typeof BusinessTypes;
export interface GoogleCallbackQuery {
  code: string;
  error?: string;
}

export type BookingStatusUnion = keyof typeof BookingStatus;
export type BookingPaymentStatusUnion = keyof typeof BookingPaymentStatus;
