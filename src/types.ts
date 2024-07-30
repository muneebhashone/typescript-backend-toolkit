import { InferSelectModel } from 'drizzle-orm';
import {
  businesses,
  users,
  apartments,
  bookingTypes,
  cancellationPolicies,
  facilities,
  houseRules,
  discounts,
  propertyTypes,
  typeOfPlace,
} from './drizzle/schema';

export type UserType = InferSelectModel<typeof users>;
export type BusinessType = InferSelectModel<typeof businesses>;
export type ApartmentType = InferSelectModel<typeof apartments>;
export type BookingTypesType = InferSelectModel<typeof bookingTypes>;
export type CancellationPoliciesType = InferSelectModel<
  typeof cancellationPolicies
>;
export type FacilitiesType = InferSelectModel<typeof facilities>;
export type HouseRulesType = InferSelectModel<typeof houseRules>;
export type DiscountsType = InferSelectModel<typeof discounts>;
export type PropertyTypesType = InferSelectModel<typeof propertyTypes>;
export type TypesOfPlaceType = InferSelectModel<typeof typeOfPlace>;
