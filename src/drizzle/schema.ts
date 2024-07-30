import { inArray, relations, sql } from 'drizzle-orm';
import {
  boolean,
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import { rolesEnums } from './enums';

export const roleEnum = pgEnum('ROLE', rolesEnums);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email'),
  tempEmail: varchar('temp_email'),
  avatar: varchar('avatar'),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  role: roleEnum('role').notNull().default(rolesEnums[0]),
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
  petHosting: decimal('petHosting', {
    precision: 10,
    scale: 2,
  }).notNull(),
  totalRating: integer('total_rating').default(0),
  ratingCount: integer('rating_count').default(0),
  areaInSqft: integer('area_in_sqft').notNull(),
  bookingTypeId: integer('booking_type_id')
    .notNull()
    .references(() => bookingTypes.id),
  businessId: integer('business_id').references(() => businesses.id, {
    onDelete: 'cascade',
  }),
  userId: integer('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  propertyType: integer('property_type').references(() => propertyTypes.id, {
    onDelete: 'set null',
  }),
  typeOfPlace: integer('type_of_place').references(() => typeOfPlace.id, {
    onDelete: 'set null',
  }),
  updatedAt: date('updated_at').$onUpdate(() => new Date().toISOString()),
  createdAt: date('created_at').$default(() => new Date().toISOString()),
});

export const apartmentPhotos = pgTable('apartment_photos', {
  id: serial('id').primaryKey(),
  apartmentId: integer('apartment_id').references(() => apartments.id, {
    onDelete: 'cascade',
  }),
  photoUrl: varchar('photo_url').notNull(),
  createdAt: date('created_at').$default(() => new Date().toISOString()),
});

export const facilities = pgTable('facilities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  icon: varchar('cover_photo_url'),
  updatedAt: date('updated_at').$onUpdate(() => new Date().toISOString()),
  createdAt: date('created_at').$default(() => new Date().toISOString()),
});

export const houseRules = pgTable('house_rules', {
  id: serial('id').primaryKey(),
  rule: text('rule').notNull(),
});

export const discounts = pgTable('discounts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  value: integer('value').notNull(),
});

export const cancellationPolicies = pgTable('cancellation_policies', {
  id: serial('id').primaryKey(),
  policy: text('policy').notNull(),
  description: text('description'),
});

export const propertyTypes = pgTable('property_types', {
  id: serial('id').primaryKey(),
  type: varchar('type', {
    length: 255,
  }),
});

export const typeOfPlace = pgTable('type_of_place', {
  id: serial('id').primaryKey(),
  type: varchar('type', {
    length: 255,
  }),
});

export const apartmentFacilities = pgTable('apartment_facilities', {
  apartmentId: integer('apartment_id').references(() => apartments.id),
  facilityId: integer('facility_id').references(() => facilities.id),
});

export const apartmentHouseRules = pgTable('apartment_house_rules', {
  apartmentId: integer('apartment_id').references(() => apartments.id),
  houseRuleId: integer('house_rule_id').references(() => houseRules.id),
});

export const apartmentDiscounts = pgTable('apartment_discounts', {
  apartmentId: integer('apartment_id').references(() => apartments.id),
  discountId: integer('discount_id').references(() => discounts.id),
});

export const apartmentCancellationPolicies = pgTable(
  'apartment_cancellation_policies',
  {
    apartmentId: integer('apartment_id').references(() => apartments.id),
    cancellationPolicyId: integer('cancellation_policy_id').references(
      () => cancellationPolicies.id,
    ),
  },
);

export const apartmentRelations = relations(apartments, ({ one, many }) => ({
  user_id: one(users, {
    fields: [apartments.userId],
    references: [users.id],
  }),
  propertyType: one(propertyTypes, {
    fields: [apartments.propertyType],
    references: [propertyTypes.id],
  }),
  typeOfPlace: one(typeOfPlace, {
    fields: [apartments.typeOfPlace],
    references: [typeOfPlace.id],
  }),
  cancellationPolicies: many(cancellationPolicies),
  facilities: many(apartmentFacilities),
  houseRules: many(apartmentHouseRules),
  discounts: many(apartmentDiscounts),
  photos: many(apartmentCancellationPolicies),
}));

export const reviews = pgTable('reviews', {});
