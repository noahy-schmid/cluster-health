CREATE TABLE "salon"."employee_service_assignments" (
	"stylistId" uuid NOT NULL,
	"serviceDefinitionId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employee_service_assignments_stylistId_serviceDefinitionId_pk" PRIMARY KEY("stylistId","serviceDefinitionId")
);
--> statement-breakpoint
CREATE TABLE "salon"."phase_resource_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phaseId" uuid NOT NULL,
	"resourceSlug" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salon"."salon_resources" (
	"salonId" uuid NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "salon_resources_salonId_slug_pk" PRIMARY KEY("salonId","slug")
);
--> statement-breakpoint
CREATE TABLE "salon"."service_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salonId" uuid NOT NULL,
	"serviceType" varchar(50) DEFAULT 'custom' NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"priceInCents" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "salon"."service_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serviceDefinitionId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"durationMinutes" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"employeeRequired" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "salon"."employee_service_assignments" ADD CONSTRAINT "employee_service_assignments_stylistId_stylists_id_fk" FOREIGN KEY ("stylistId") REFERENCES "salon"."stylists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salon"."employee_service_assignments" ADD CONSTRAINT "employee_service_assignments_serviceDefinitionId_service_definitions_id_fk" FOREIGN KEY ("serviceDefinitionId") REFERENCES "salon"."service_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salon"."phase_resource_requirements" ADD CONSTRAINT "phase_resource_requirements_phaseId_service_phases_id_fk" FOREIGN KEY ("phaseId") REFERENCES "salon"."service_phases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salon"."salon_resources" ADD CONSTRAINT "salon_resources_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salon"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salon"."service_definitions" ADD CONSTRAINT "service_definitions_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salon"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salon"."service_phases" ADD CONSTRAINT "service_phases_serviceDefinitionId_service_definitions_id_fk" FOREIGN KEY ("serviceDefinitionId") REFERENCES "salon"."service_definitions"("id") ON DELETE cascade ON UPDATE no action;