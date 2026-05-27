-- Create "notifications" table
CREATE TABLE "notifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  "user_id" uuid NOT NULL,
  "title" character varying(255) NOT NULL,
  "message" text NOT NULL,
  "link" text NULL,
  "is_read" bigint NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_notifications_deleted_at" to table: "notifications"
CREATE INDEX "idx_notifications_deleted_at" ON "notifications" ("deleted_at");
-- Create index "idx_notifications_user_id" to table: "notifications"
CREATE INDEX "idx_notifications_user_id" ON "notifications" ("user_id");
