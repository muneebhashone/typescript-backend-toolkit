DO $$ BEGIN
 CREATE TYPE "public"."ROLE" AS ENUM('DEFAULT_USER', 'SUPER_ADMIN', 'VENDOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"role" "ROLE" DEFAULT 'DEFAULT_USER' NOT NULL,
	"dob" date NOT NULL,
	"phone_no" varchar NOT NULL,
	"phone_country" varchar NOT NULL,
	"is_active" boolean DEFAULT false,
	"password" varchar NOT NULL,
	"password_reset_token" varchar,
	"set_password_token" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
