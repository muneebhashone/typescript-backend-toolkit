import { InferSelectModel } from 'drizzle-orm';
import {
  businesses,
  users,
  apartments,
  bookingTypes,
  cancellationPolicies,
  facilities,
} from './drizzle/schema';

export type UserType = InferSelectModel<typeof users>;
export type BusinessType = InferSelectModel<typeof businesses>;
export type ApartmentType = InferSelectModel<typeof apartments>;
export type BookingTypesType = InferSelectModel<typeof bookingTypes>;
export type CancellationPoliciesType = InferSelectModel<
  typeof cancellationPolicies
>;
export type FacilitiesType = InferSelectModel<typeof facilities>;
