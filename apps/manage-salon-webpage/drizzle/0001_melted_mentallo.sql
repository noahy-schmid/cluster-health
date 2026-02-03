CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"websiteId" uuid NOT NULL,
	"type" varchar NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "text_with_image_sections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"image" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "heroImage" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "logo" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_websiteId_websites_id_fk" FOREIGN KEY ("websiteId") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_with_image_sections" ADD CONSTRAINT "text_with_image_sections_id_sections_id_fk" FOREIGN KEY ("id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;