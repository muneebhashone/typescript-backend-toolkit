DO $$ BEGIN
 CREATE TYPE "public"."ROLE" AS ENUM('DEFAULT_USER', 'SUPER_ADMIN', 'VENDOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apartment_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"apartment_id" integer,
	"photo_url" varchar NOT NULL,
	"created_at" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apartments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cover_photo_url" varchar,
	"video_url" varchar,
	"description" text,
	"address" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"zipcode" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"propertyPrice" numeric(10, 2) NOT NULL,
	"number_of_rooms" integer NOT NULL,
	"number_of_bathrooms" integer NOT NULL,
	"number_of_bedrooms" integer NOT NULL,
	"number_of_pets" integer NOT NULL,
	"number_of_persons_allowed" integer NOT NULL,
	"petHosting" numeric(10, 2) NOT NULL,
	"total_rating" integer DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"area_in_sqft" integer NOT NULL,
	"booking_type_id" integer NOT NULL,
	"business_id" integer,
	"user_id" integer,
	"property_type" integer,
	"type_of_place" integer,
	"cancellation_policies" integer[] DEFAULT '{}',
	"facilities" integer[] DEFAULT '{}',
	"house_rules" integer[] DEFAULT '{}',
	"discounts" integer[] DEFAULT '{}',
	"updated_at" date,
	"created_at" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "booking_types_name_unique" UNIQUE("name")
);
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
CREATE TABLE IF NOT EXISTS "cancellation_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(255),
	"value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cover_photo_url" varchar,
	"updated_at" date,
	"created_at" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "house_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "property_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "type_of_place" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar,
	"temp_email" varchar,
	"avatar" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"role" "public"."ROLE" DEFAULT 'DEFAULT_USER' NOT NULL,
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
 ALTER TABLE "apartment_photos" ADD CONSTRAINT "apartment_photos_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apartments" ADD CONSTRAINT "apartments_booking_type_id_booking_types_id_fk" FOREIGN KEY ("booking_type_id") REFERENCES "public"."booking_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apartments" ADD CONSTRAINT "apartments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apartments" ADD CONSTRAINT "apartments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apartments" ADD CONSTRAINT "apartments_property_type_property_types_id_fk" FOREIGN KEY ("property_type") REFERENCES "public"."property_types"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apartments" ADD CONSTRAINT "apartments_type_of_place_type_of_place_id_fk" FOREIGN KEY ("type_of_place") REFERENCES "public"."type_of_place"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
