CREATE TABLE "reason_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reasonSectionId" uuid NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"imageUrl" varchar,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reason_sections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"subtitle" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reason_items" ADD CONSTRAINT "reason_items_reasonSectionId_reason_sections_id_fk" FOREIGN KEY ("reasonSectionId") REFERENCES "public"."reason_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reason_sections" ADD CONSTRAINT "reason_sections_id_sections_id_fk" FOREIGN KEY ("id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;