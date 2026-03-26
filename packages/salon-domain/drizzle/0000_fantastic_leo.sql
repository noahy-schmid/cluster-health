CREATE SCHEMA IF NOT EXISTS "salon";
--> statement-breakpoint
CREATE TABLE "salon"."salons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"street" varchar(255) NOT NULL,
	"postalCode" varchar(20) NOT NULL,
	"city" varchar(255) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "salons_name_unique" UNIQUE("name")
);
