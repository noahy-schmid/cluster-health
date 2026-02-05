CREATE TABLE "gallery_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gallerySectionId" uuid NOT NULL,
	"imageUrl" varchar NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_sections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"subtitle" varchar NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "websites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salonId" uuid NOT NULL,
	"heroImage" varchar NOT NULL,
	"logo" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_gallerySectionId_gallery_sections_id_fk" FOREIGN KEY ("gallerySectionId") REFERENCES "public"."gallery_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_sections" ADD CONSTRAINT "gallery_sections_id_sections_id_fk" FOREIGN KEY ("id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_websiteId_websites_id_fk" FOREIGN KEY ("websiteId") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_with_image_sections" ADD CONSTRAINT "text_with_image_sections_id_sections_id_fk" FOREIGN KEY ("id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;