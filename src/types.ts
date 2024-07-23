import { InferSelectModel } from 'drizzle-orm';
import { businesses, users, apartments } from './drizzle/schema';

export type UserType = InferSelectModel<typeof users>;
export type BusinessType = InferSelectModel<typeof businesses>;
export type ApartmentType = InferSelectModel<typeof apartments>;
