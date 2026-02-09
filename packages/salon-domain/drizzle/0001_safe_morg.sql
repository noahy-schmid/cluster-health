ALTER TABLE "salon"."salons" DROP CONSTRAINT "salons_name_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "salons_name_ci_unique" ON "salon"."salons" USING btree (lower("name"));