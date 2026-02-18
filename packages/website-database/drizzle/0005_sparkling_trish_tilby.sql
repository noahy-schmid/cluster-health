CREATE TABLE "stylists_sections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"subtitle" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stylists_sections" ADD CONSTRAINT "stylists_sections_id_sections_id_fk" FOREIGN KEY ("id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;