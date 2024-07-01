import {
  boolean,
  date,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import { rolesEnums } from './enums';
import { integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('ROLE', rolesEnums);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email'),
  avatar: varchar('avatar'),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  role: roleEnum('role').notNull().default('DEFAULT_USER'),
  dob: date('dob'),
  phoneNo: varchar('phone_no'),
  isActive: boolean('is_active').default(false),
  password: varchar('password'),
  passwordResetToken: varchar('password_reset_token'),
  setPasswordToken: varchar('set_password_token'),
  otp: varchar('otp'),
  loginOtp: varchar('login_otp'),
  country: varchar('country'),
  state: varchar('state'),
  city: varchar('city'),
  streetAddress: varchar('streetAddress'),
  businessId: integer('business_id').references(() => businesses.id, {
    onDelete: 'cascade',
  }),
  postalCode: varchar('postalCode'),
  updatedAt: date('updated_at').$onUpdate(() => new Date().toISOString()),
  createdAt: date('created_at').$default(() => new Date().toISOString()),
});

export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  thumbnail: varchar('thumbnail'),
  name: varchar('name').unique().notNull(),
  updatedAt: date('updated_at').$onUpdate(() => new Date().toISOString()),
  createdAt: date('created_at').$default(() => new Date().toISOString()),
});

export const userBusinessRelation = relations(users, ({ one }) => ({
  business: one(businesses, {
    fields: [users.businessId],
    references: [businesses.id],
  }),
}));
