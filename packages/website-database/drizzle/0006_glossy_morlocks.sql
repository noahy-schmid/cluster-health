ALTER TABLE "websites" ADD COLUMN "heroTitle" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "favicon" varchar;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_salonId_unique" UNIQUE("salonId");