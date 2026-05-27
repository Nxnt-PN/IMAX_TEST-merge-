-- Modify "roles" table
ALTER TABLE "roles" ALTER COLUMN "status" DROP DEFAULT;
-- Modify "users" table
ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT;
