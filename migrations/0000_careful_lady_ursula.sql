DO $$ BEGIN
 CREATE TYPE "public"."ROLE" AS ENUM('WHITE_LABEL_ADMIN', 'WHITE_LABEL_SUB_ADMIN', 'CLIENT_SUPER_USER', 'CLIENT_USER', 'SUPER_ADMIN', 'SUB_ADMIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."SHIPMENT_TRACK_WITH" AS ENUM('CONTAINER_NUMBER', 'MBL_NUMBER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."USER_STATUS" AS ENUM('REJECTED', 'APPROVED', 'REQUESTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"address" varchar,
	"country" varchar,
	"city" varchar,
	"industry" varchar,
	"created_at" date DEFAULT now(),
	"updated_at" date DEFAULT now(),
	"credits" integer DEFAULT 0,
	"status" "USER_STATUS" NOT NULL,
	CONSTRAINT "companies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" varchar,
	"carrier" varchar NOT NULL,
	"aggregator" varchar,
	"arrivalTime" varchar,
	"created_at" date DEFAULT now(),
	"sealine" varchar,
	"container_no" varchar,
	"mbl_no" varchar,
	"trackWith" "SHIPMENT_TRACK_WITH" NOT NULL,
	"type" varchar,
	"company_id" integer,
	"creator_id" integer NOT NULL,
	"reference_no" varchar,
	"followers" text[],
	"tags" text[],
	"progress" varchar NOT NULL,
	"is_tracking" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"role" "ROLE" DEFAULT 'CLIENT_SUPER_USER' NOT NULL,
	"is_active" boolean DEFAULT false,
	"password" varchar NOT NULL,
	"password_reset_token" varchar,
	"set_password_token" varchar,
	"status" "USER_STATUS" NOT NULL,
	"company_id" integer,
	"client_id" integer,
	"permissions" text[],
	"credits" integer DEFAULT 0,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vessels" (
	"id" serial PRIMARY KEY NOT NULL,
	"fid" integer,
	"name" varchar,
	"flag" varchar,
	"shipment_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipments" ADD CONSTRAINT "shipments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipments" ADD CONSTRAINT "shipments_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vessels" ADD CONSTRAINT "vessels_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
