ALTER TABLE "users" RENAME COLUMN "password_reset_token" TO "password_reset_code";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "set_password_token" TO "set_password_code";