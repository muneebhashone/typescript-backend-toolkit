CREATE TABLE IF NOT EXISTS "property_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "type_of_place" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "apartments" ADD COLUMN "total_rating" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "apartments" ADD COLUMN "rating_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "apartments" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "apartments" ADD COLUMN "property_type" integer;--> statement-breakpoint
ALTER TABLE "apartments" ADD COLUMN "type_of_place" integer;--> statement-breakpoint
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
