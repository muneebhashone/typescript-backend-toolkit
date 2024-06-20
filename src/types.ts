import { InferSelectModel } from 'drizzle-orm';
import { users } from './drizzle/schema';

export type UserType = InferSelectModel<typeof users>;
