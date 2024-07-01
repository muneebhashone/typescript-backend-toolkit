import { InferSelectModel } from 'drizzle-orm';
import { businesses, users } from './drizzle/schema';

export type UserType = InferSelectModel<typeof users>;
export type BusinessType = InferSelectModel<typeof businesses>;
