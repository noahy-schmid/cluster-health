CREATE TABLE "center_text_sections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "center_text_sections" ADD CONSTRAINT "center_text_sections_id_sections_id_fk" FOREIGN KEY ("id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;