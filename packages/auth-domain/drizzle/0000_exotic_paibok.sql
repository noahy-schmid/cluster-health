CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE TABLE "auth"."management_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" text NOT NULL,
	"createdAt" integer NOT NULL,
	"passwortUpdatedAt" integer NOT NULL,
	CONSTRAINT "management_user_email_unique" UNIQUE("email")
);
