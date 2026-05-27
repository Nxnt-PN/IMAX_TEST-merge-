-- Create "systems" table
CREATE TABLE "systems" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  "name" character varying(255) NOT NULL,
  "slug" character varying(255) NOT NULL,
  "workflow_id" uuid NOT NULL,
  "status" bigint NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_workflows_systems" FOREIGN KEY ("workflow_id") REFERENCES "workflows" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);
-- Create index "idx_systems_deleted_at" to table: "systems"
CREATE INDEX "idx_systems_deleted_at" ON "systems" ("deleted_at");
