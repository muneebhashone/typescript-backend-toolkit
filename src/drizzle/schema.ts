import {
  boolean,
  date,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import { cancellationPoliciesEnums, discountEnums, rolesEnums } from './enums';
import { integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';
import { decimal } from 'drizzle-orm/pg-core';
import { jsonb } from 'drizzle-orm/pg-core';

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

// Apartments, Boat, Car, Jet
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

export const bookingTypes = pgTable('booking_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
});

export const apartments = pgTable('apartments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  coverPhotoUrl: varchar('cover_photo_url'),
  video_url: varchar('video_url'),
  description: text('description'),
  address: varchar('address', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  zipCode: varchar('zipcode', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  propertyPrice: decimal('propertyPrice', {
    precision: 10,
    scale: 2,
  }).notNull(),
  numberOfRooms: integer('number_of_rooms').notNull(),
  numberOfBathrooms: integer('number_of_bathrooms').notNull(),
  numberOfBedrooms: integer('number_of_bedrooms').notNull(),
  numberOfPets: integer('number_of_pets').notNull(),
  numberOfPersonsAllowed: integer('number_of_persons_allowed').notNull(),
  petHosting: decimal('propertyPrice', {
    precision: 10,
    scale: 2,
  }).notNull(),
  areaInSqft: integer('area_in_sqft').notNull(),
  bookingTypeId: integer('booking_type_id')
    .notNull()
    .references(() => bookingTypes.id),
  discountTypeId: integer('booking_type_id').references(() => discounts.id, {
    onDelete: 'set null',
  }),
  cancellationPolicies: text('cancellation_policies', {
    enum: cancellationPoliciesEnums,
  })
    .array()
    .default([]),
  amenities: jsonb('amenities').notNull(),
  discountId: integer('discount').references(() => discounts.id, {
    onDelete: 'set null',
  }),
  updatedAt: date('updated_at').$onUpdate(() => new Date().toISOString()),
  createdAt: date('created_at').$default(() => new Date().toISOString()),
});

export const houseRules = pgTable('house_rules', {
  id: serial('id').primaryKey(),
  rule: text('rule').notNull(),
});

export const discounts = pgTable('discounts', {
  id: serial('id').primaryKey(),
  discountType: text('discountType', {
    enum: discountEnums,
  }).notNull(),
  value: integer('value').notNull(),
});

export const apartmentPhotos = pgTable('appartment_photos', {
  id: serial('id').primaryKey(),
  appartmentId: integer('appartment_id').references(() => apartments.id, {
    onDelete: 'cascade',
  }),
  photoUrl: varchar('photo_url').notNull(),
  createdAt: date('created_at').$default(() => new Date().toISOString()),
});

export const apartmentPhotosRelation = relations(apartments, ({ many }) => ({
  photos: many(apartmentPhotos),
}));

export const photosApartmentRelation = relations(
  apartmentPhotos,
  ({ one }) => ({
    apartment: one(apartments, {
      fields: [apartmentPhotos.appartmentId],
      references: [apartments.id],
    }),
  }),
);

export const apartmentRulesRelation = relations(apartments, ({ many }) => ({
  rules: many(houseRules),
}));

export const apartmentDiscountsRelation = relations(apartments, ({ many }) => ({
  discounts: many(discounts),
}));
