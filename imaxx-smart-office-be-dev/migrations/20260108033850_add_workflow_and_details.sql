-- Create "workflows" table
CREATE TABLE "workflows" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  "name" character varying(255) NOT NULL,
  "status" bigint NOT NULL,
  PRIMARY KEY ("id")
);
-- Create index "idx_workflows_deleted_at" to table: "workflows"
CREATE INDEX "idx_workflows_deleted_at" ON "workflows" ("deleted_at");
-- Create "workflow_details" table
CREATE TABLE "workflow_details" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  "workflow_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "name" character varying(255) NOT NULL,
  "seq" bigint NOT NULL,
  "is_final" bigint NOT NULL,
  "status" bigint NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_workflow_details_role" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_workflows_workflow_details" FOREIGN KEY ("workflow_id") REFERENCES "workflows" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);
-- Create index "idx_workflow_details_deleted_at" to table: "workflow_details"
CREATE INDEX "idx_workflow_details_deleted_at" ON "workflow_details" ("deleted_at");
