ALTER TABLE "sections" ADD COLUMN "menuTitle" varchar;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "title" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "subtitle" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "slug" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "colorBackgroundBase" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "colorBackgroundElevation1" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "colorBackgroundElevation2" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "colorForegroundBase" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "colorForegroundMuted" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "colorForegroundStrong" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "colorAccent" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "colorOnAccent" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_slug_unique" UNIQUE("slug");