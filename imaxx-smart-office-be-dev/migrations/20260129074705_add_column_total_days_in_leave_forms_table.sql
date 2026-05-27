-- Modify "leave_forms" table
ALTER TABLE "leave_forms" ADD COLUMN "total_days" numeric(10,2) NOT NULL DEFAULT 0;
