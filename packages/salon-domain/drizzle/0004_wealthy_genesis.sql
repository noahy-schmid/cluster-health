ALTER TABLE "salon"."media_files" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "salon"."media_files" ALTER COLUMN "createdAt" SET DEFAULT now();