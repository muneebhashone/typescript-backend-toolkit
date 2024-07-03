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
  tempEmail: varchar('temp_email'),
  avatar: varchar('avatar'),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  role: roleEnum('role').notNull().default('DEFAULT_USER'),
  dob: date('dob'),
  phoneNo: varchar('phone_no'),
  tempPhoneNo: varchar('temp_phone_no'),
  isActive: boolean('is_active').default(false),
  password: varchar('password'),
  passwordResetCode: varchar('password_reset_code'),
  setPasswordCode: varchar('set_password_code'),
  otp: varchar('otp'),
  loginOtp: varchar('login_otp'),
  updateOtp: varchar('update_otp'),
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
  accountName: varchar('account_name'),
  bankName: varchar('bank_name'),
  accountNumber: varchar('account_number'),
  interest: integer('interest').references(() => businesses.id, {
    onDelete: 'set null',
  }),
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
