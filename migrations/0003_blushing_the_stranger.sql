CREATE TABLE IF NOT EXISTS "apartment_facilities" (
	"apartment_id" integer,
	"facility_id" integer
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
DO $$ BEGIN
 ALTER TABLE "apartment_facilities" ADD CONSTRAINT "apartment_facilities_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apartment_facilities" ADD CONSTRAINT "apartment_facilities_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
