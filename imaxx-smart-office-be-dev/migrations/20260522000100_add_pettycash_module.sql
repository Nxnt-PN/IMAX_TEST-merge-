CREATE TABLE "petty_cash_projects" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "project_name" character varying(100) NOT NULL,
  "description" text NULL,
  "status" bigint NOT NULL DEFAULT 1,
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_petty_cash_projects_created_user" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_projects_updated_user" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_projects_deleted_user" FOREIGN KEY ("deleted_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX "idx_petty_cash_projects_deleted_at" ON "petty_cash_projects" ("deleted_at");

CREATE TABLE "petty_cash_reasons" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "system_id" uuid NULL,
  "reason_name" character varying(100) NOT NULL,
  "description" text NULL,
  "status" bigint NOT NULL DEFAULT 1,
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_petty_cash_reasons_system" FOREIGN KEY ("system_id") REFERENCES "systems" ("id") ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT "fk_petty_cash_reasons_created_user" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_reasons_updated_user" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_reasons_deleted_user" FOREIGN KEY ("deleted_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE INDEX "idx_petty_cash_reasons_deleted_at" ON "petty_cash_reasons" ("deleted_at");

CREATE TABLE "petty_cash_forms" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "workflow_id" uuid NOT NULL,
  "document_no" character varying(20) NULL,
  "title" character varying(100) NOT NULL,
  "state" bigint NOT NULL DEFAULT 1,
  "state_detail" character varying(100) NULL,
  "role_id" uuid NULL,
  "total_amount" bigint NOT NULL DEFAULT 0,
  "note" character varying(100) NULL,
  "reject_comment" text NULL,
  "rejected_by" uuid NULL,
  "rejected_at" timestamp NULL,
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_petty_cash_forms_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_forms_workflow" FOREIGN KEY ("workflow_id") REFERENCES "workflows" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_forms_role" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_forms_rejected_user" FOREIGN KEY ("rejected_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_forms_created_user" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_forms_updated_user" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_forms_deleted_user" FOREIGN KEY ("deleted_by") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE UNIQUE INDEX "idx_petty_cash_forms_document_no" ON "petty_cash_forms" ("document_no");
CREATE INDEX "idx_petty_cash_forms_deleted_at" ON "petty_cash_forms" ("deleted_at");

CREATE TABLE "petty_cash_form_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "petty_cash_form_id" uuid NOT NULL,
  "project_id" uuid NOT NULL,
  "reason_id" uuid NOT NULL,
  "date" timestamp NOT NULL,
  "description" text NULL,
  "note" text NULL,
  "total" bigint NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_petty_cash_form_items_form" FOREIGN KEY ("petty_cash_form_id") REFERENCES "petty_cash_forms" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "fk_petty_cash_form_items_project" FOREIGN KEY ("project_id") REFERENCES "petty_cash_projects" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_petty_cash_form_items_reason" FOREIGN KEY ("reason_id") REFERENCES "petty_cash_reasons" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE "petty_cash_attachments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "petty_cash_form_item_id" uuid NOT NULL,
  "file_name" character varying(100) NOT NULL,
  "file_path" character varying(100) NOT NULL,
  "file_size" bigint NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_petty_cash_attachments_item" FOREIGN KEY ("petty_cash_form_item_id") REFERENCES "petty_cash_form_items" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE "petty_cash_histories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "petty_cash_form_id" uuid NOT NULL,
  "user_id" uuid NULL,
  "action" character varying(50) NOT NULL,
  "remark" text NULL,
  "state" bigint NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_petty_cash_histories_form" FOREIGN KEY ("petty_cash_form_id") REFERENCES "petty_cash_forms" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "fk_petty_cash_histories_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
