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
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_gallerySectionId_gallery_sections_id_fk" FOREIGN KEY ("gallerySectionId") REFERENCES "public"."gallery_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_sections" ADD CONSTRAINT "gallery_sections_id_sections_id_fk" FOREIGN KEY ("id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;