-- Modify "leave_forms" table
ALTER TABLE "leave_forms" ADD COLUMN "reason" text NULL, ADD COLUMN "file_path" character varying(500) NULL;
