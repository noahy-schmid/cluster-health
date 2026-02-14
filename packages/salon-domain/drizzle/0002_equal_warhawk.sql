CREATE TABLE "salon"."stylists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salonId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"subtitle" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"profileImage" varchar(500) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "salon"."stylists" ADD CONSTRAINT "stylists_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salon"."salons"("id") ON DELETE cascade ON UPDATE no action;