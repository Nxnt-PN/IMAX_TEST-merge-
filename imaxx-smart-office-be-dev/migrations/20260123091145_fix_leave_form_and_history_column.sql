-- Rename a column from "status" to "state"
ALTER TABLE "leave_form_histories" RENAME COLUMN "status" TO "state";
-- Modify "leave_forms" table
ALTER TABLE "leave_forms" ALTER COLUMN "workflow_id" DROP NOT NULL, ALTER COLUMN "role_id" DROP NOT NULL;
