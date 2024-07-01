ALTER TABLE "businesses" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "thumbnail" varchar;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "updated_at" date;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "created_at" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" date;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_name_unique" UNIQUE("name");