ALTER TABLE "users" ADD COLUMN "temp_email" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "temp_phone_no" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "update_otp" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_name" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_name" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_number" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "interest" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_interest_businesses_id_fk" FOREIGN KEY ("interest") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
