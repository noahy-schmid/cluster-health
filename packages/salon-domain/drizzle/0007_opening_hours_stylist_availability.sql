CREATE TABLE "salon"."salon_opening_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salonId" uuid NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"openTime" varchar(5) NOT NULL,
	"closeTime" varchar(5) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salon"."salon_opening_hours_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salonId" uuid NOT NULL,
	"date" date NOT NULL,
	"isClosed" boolean DEFAULT true NOT NULL,
	"openTime" varchar(5),
	"closeTime" varchar(5),
	"reason" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salon"."stylist_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stylistId" uuid NOT NULL,
	"salonId" uuid NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"startTime" varchar(5) NOT NULL,
	"endTime" varchar(5) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salon"."stylist_availability_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stylistId" uuid NOT NULL,
	"salonId" uuid NOT NULL,
	"date" date NOT NULL,
	"isAbsent" boolean DEFAULT true NOT NULL,
	"startTime" varchar(5),
	"endTime" varchar(5),
	"reason" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "salon"."salon_opening_hours" ADD CONSTRAINT "salon_opening_hours_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salon"."salons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "salon"."salon_opening_hours_exceptions" ADD CONSTRAINT "salon_opening_hours_exceptions_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salon"."salons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "salon"."stylist_availability" ADD CONSTRAINT "stylist_availability_stylistId_stylists_id_fk" FOREIGN KEY ("stylistId") REFERENCES "salon"."stylists"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "salon"."stylist_availability" ADD CONSTRAINT "stylist_availability_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salon"."salons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "salon"."stylist_availability_exceptions" ADD CONSTRAINT "stylist_availability_exceptions_stylistId_stylists_id_fk" FOREIGN KEY ("stylistId") REFERENCES "salon"."stylists"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "salon"."stylist_availability_exceptions" ADD CONSTRAINT "stylist_availability_exceptions_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salon"."salons"("id") ON DELETE cascade ON UPDATE no action;
