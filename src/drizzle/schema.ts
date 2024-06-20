import { relations } from 'drizzle-orm';
import {
  AnyPgColumn,
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  permissionEnums,
  rolesEnums,
  statusEnums,
  trackWithEnums,
} from './enums';

export const roleEnum = pgEnum('ROLE', rolesEnums);
export const statusPgEnum = pgEnum('USER_STATUS', statusEnums);
export const shipmentTrackWithEnum = pgEnum(
  'SHIPMENT_TRACK_WITH',
  trackWithEnums,
);

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name').unique(),
  address: varchar('address'),
  country: varchar('country'),
  city: varchar('city'),
  industry: varchar('industry'),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
  credits: integer('credits').default(0),
  status: statusPgEnum('status').notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').unique().notNull(),
  name: varchar('name').notNull(),
  role: roleEnum('role').notNull().default('CLIENT_SUPER_USER'),
  isActive: boolean('is_active').default(false),
  password: varchar('password').notNull(),
  passwordResetToken: varchar('password_reset_token'),
  setPasswordToken: varchar('set_password_token'),
  status: statusPgEnum('status').notNull(),
  companyId: integer('company_id').references(() => companies.id, {
    onDelete: 'cascade',
  }),
  clientId: integer('client_id').references((): AnyPgColumn => users.id, {
    onDelete: 'cascade',
  }),
  permissions: text('permissions', {
    enum: permissionEnums,
  }).array(),
  credits: integer('credits').default(0),
});

export const vessels = pgTable('vessels', {
  id: serial('id').primaryKey(),
  fid: integer('fid'),
  name: varchar('name'),
  flag: varchar('flag'),
  shipmentId: integer('shipment_id').references(() => shipments.id),
});

export const shipments = pgTable('shipments', {
  id: serial('id').primaryKey(),
  status: varchar('status'),
  carrier: varchar('carrier').notNull(),
  aggregator: varchar('aggregator'),
  arrivalTime: varchar('arrivalTime'),
  createdAt: date('created_at').defaultNow(),
  sealine: varchar('sealine'),
  containerNo: varchar('container_no'),
  mblNo: varchar('mbl_no'),
  trackWith: shipmentTrackWithEnum('trackWith').notNull(),
  type: varchar('type'),
  companyId: integer('company_id').references(() => companies.id),
  creatorId: integer('creator_id')
    .references(() => users.id)
    .notNull(),
  referenceNo: varchar('reference_no'),
  followers: text('followers').array(),
  tags: text('tags').array(),
  progress: varchar('progress').notNull(),
  isTracking: boolean('is_tracking').default(false),
});

export const shipmentsRelations = relations(shipments, ({ many, one }) => ({
  vessels: many(vessels),
  company: one(companies, {
    fields: [shipments.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [shipments.creatorId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  client: one(users, {
    fields: [users.clientId],
    references: [users.id],
  }),
}));

export const vesselsRelations = relations(vessels, ({ one }) => ({
  shipment: one(shipments, {
    fields: [vessels.shipmentId],
    references: [shipments.id],
  }),
}));
