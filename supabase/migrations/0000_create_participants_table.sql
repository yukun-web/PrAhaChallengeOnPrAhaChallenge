CREATE SCHEMA "participant";
--> statement-breakpoint
CREATE TABLE "participant"."participants" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"data" jsonb
);
