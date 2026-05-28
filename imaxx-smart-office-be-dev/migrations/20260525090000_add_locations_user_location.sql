-- Create "locations" table
CREATE TABLE "locations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  "location_name" character varying(100) NOT NULL,
  "status" bigint NOT NULL DEFAULT 1,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_locations_created_user" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_locations_updated_user" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_locations_deleted_user" FOREIGN KEY ("deleted_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_locations_deleted_at" to table: "locations"
CREATE INDEX "idx_locations_deleted_at" ON "locations" ("deleted_at");
-- Modify "users" table
ALTER TABLE "users" ADD COLUMN "location_id" uuid NULL;
ALTER TABLE "users" ADD CONSTRAINT "fk_locations_users" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
