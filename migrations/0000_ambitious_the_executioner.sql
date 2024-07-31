DO $$ BEGIN
 CREATE TYPE "public"."ROLE" AS ENUM('DEFAULT_USER', 'SUPER_ADMIN', 'VENDOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"thumbnail" varchar,
	"name" varchar NOT NULL,
	"updated_at" date,
	"created_at" date,
	CONSTRAINT "businesses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar,
	"temp_email" varchar,
	"avatar" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"role" "ROLE" DEFAULT 'DEFAULT_USER' NOT NULL,
	"dob" date,
	"phone_no" varchar,
	"temp_phone_no" varchar,
	"is_active" boolean DEFAULT false,
	"password" varchar,
	"password_reset_code" varchar,
	"set_password_code" varchar,
	"otp" varchar,
	"login_otp" varchar,
	"update_otp" varchar,
	"country" varchar,
	"state" varchar,
	"city" varchar,
	"streetAddress" varchar,
	"business_id" integer,
	"postalCode" varchar,
	"updated_at" date,
	"created_at" date,
	"account_name" varchar,
	"bank_name" varchar,
	"account_number" varchar,
	"interest" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_interest_businesses_id_fk" FOREIGN KEY ("interest") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
