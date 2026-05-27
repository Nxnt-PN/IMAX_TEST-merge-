-- Create "leave_forms" table
CREATE TABLE "leave_forms" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  "user_id" uuid NOT NULL,
  "leave_type" character varying(10) NOT NULL,
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "workflow_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "state" bigint NOT NULL,
  "state_detail" character varying(100) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_leave_forms_role" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_leave_forms_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_leave_forms_workflow" FOREIGN KEY ("workflow_id") REFERENCES "workflows" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_leave_forms_deleted_at" to table: "leave_forms"
CREATE INDEX "idx_leave_forms_deleted_at" ON "leave_forms" ("deleted_at");
-- Create index "idx_leave_forms_leave_type" to table: "leave_forms"
CREATE INDEX "idx_leave_forms_leave_type" ON "leave_forms" ("leave_type");
-- Create "leave_form_histories" table
CREATE TABLE "leave_form_histories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  "leave_form_id" uuid NOT NULL,
  "action" character varying(50) NOT NULL,
  "remark" text NULL,
  "status" bigint NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_leave_forms_leave_form_histories" FOREIGN KEY ("leave_form_id") REFERENCES "leave_forms" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);
-- Create index "idx_leave_form_histories_deleted_at" to table: "leave_form_histories"
CREATE INDEX "idx_leave_form_histories_deleted_at" ON "leave_form_histories" ("deleted_at");
