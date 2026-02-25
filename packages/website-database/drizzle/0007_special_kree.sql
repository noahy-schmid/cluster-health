CREATE TABLE "media_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"websiteId" uuid NOT NULL,
	"fileName" varchar NOT NULL,
	"mimeType" varchar NOT NULL,
	"fileSize" integer NOT NULL,
	"s3Key" varchar NOT NULL,
	"uploadConfirmed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_websiteId_websites_id_fk" FOREIGN KEY ("websiteId") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;