CREATE TABLE "auth"."management_user_role" (
	"userId" uuid NOT NULL,
	"roleId" varchar(255) NOT NULL,
	"assignedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"revokedAt" timestamp with time zone,
	"assignedBy" uuid
);
--> statement-breakpoint
ALTER TABLE "auth"."management_user" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth"."management_user" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "auth"."management_user" ALTER COLUMN "passwortUpdatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth"."management_user" ALTER COLUMN "passwortUpdatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "auth"."management_user" ADD COLUMN "salonId" uuid;--> statement-breakpoint
ALTER TABLE "auth"."management_user_role" ADD CONSTRAINT "management_user_role_userId_management_user_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."management_user"("id") ON DELETE cascade ON UPDATE no action;