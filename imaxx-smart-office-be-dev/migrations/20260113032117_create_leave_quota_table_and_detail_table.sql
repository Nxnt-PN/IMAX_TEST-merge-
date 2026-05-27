-- Create "leave_quota" table
CREATE TABLE "leave_quota" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  "year" bigint NOT NULL,
  "status" bigint NOT NULL,
  PRIMARY KEY ("id")
);
-- Create index "idx_leave_quota_deleted_at" to table: "leave_quota"
CREATE INDEX "idx_leave_quota_deleted_at" ON "leave_quota" ("deleted_at");
-- Create "leave_quota_details" table
CREATE TABLE "leave_quota_details" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NULL,
  "created_at" timestamp NOT NULL,
  "updated_by" uuid NULL,
  "updated_at" timestamp NULL,
  "deleted_by" uuid NULL,
  "deleted_at" timestamp NULL,
  "leave_quota_id" uuid NOT NULL,
  "work_year_min" numeric NOT NULL,
  "work_year_max" numeric NOT NULL,
  "absence_quota" bigint NOT NULL,
  "annual_quota" bigint NOT NULL,
  "sick_quota" bigint NOT NULL,
  "status" bigint NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_leave_quota_leave_quota_details" FOREIGN KEY ("leave_quota_id") REFERENCES "leave_quota" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);
-- Create index "idx_leave_quota_details_deleted_at" to table: "leave_quota_details"
CREATE INDEX "idx_leave_quota_details_deleted_at" ON "leave_quota_details" ("deleted_at");
