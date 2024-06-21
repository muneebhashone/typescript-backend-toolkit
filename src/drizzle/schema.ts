import {
  boolean,
  date,
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
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name').notNull(),
  role: roleEnum('role').notNull().default('DEFAULT_USER'),
  dob: date('dob').notNull(),
  phoneNo: varchar('phone_no').notNull(),
  phoneCountry: varchar('phone_country').notNull(),
  isActive: boolean('is_active').default(false),
  password: varchar('password').notNull(),
  passwordResetToken: varchar('password_reset_token'),
  setPasswordToken: varchar('set_password_token'),
  otp: varchar('otp'),
});
