ALTER TABLE "websites" RENAME COLUMN "favicon" TO "faviconMediaId";
--> statement-breakpoint
UPDATE "websites"
SET "faviconMediaId" = NULL
WHERE "faviconMediaId" IS NOT NULL
  AND NOT "faviconMediaId" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
