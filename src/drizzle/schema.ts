import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import { rolesEnums } from './enums';

export const roleEnum = pgEnum('ROLE', rolesEnums);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').unique().notNull(),
  name: varchar('name').notNull(),
  role: roleEnum('role').notNull().default('CLIENT_SUPER_USER'),
  isActive: boolean('is_active').default(false),
  password: varchar('password').notNull(),
  passwordResetToken: varchar('password_reset_token'),
  setPasswordToken: varchar('set_password_token'),
  credits: integer('credits').default(0),
});
