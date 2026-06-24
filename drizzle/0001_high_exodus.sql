CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'customer' NOT NULL;