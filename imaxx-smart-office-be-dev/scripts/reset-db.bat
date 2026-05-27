@echo off
set DB_URL=postgres://postgres:postgres@localhost:5432/imaxx_office?sslmode=disable

echo 🧹 Truncating data...
psql "%DB_URL%" -c "DO $BODY$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'atlas_schema_revisions') LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE'; END LOOP; END $BODY$;"

echo 🚀 Applying migrations...
atlas migrate apply --env gorm --url "%DB_URL%"

echo 🌱 Seeding data...
go run main.go -seed=t
if %ERRORLEVEL% NEQ 0 (echo ❌ Seeding failed & pause & exit /b %ERRORLEVEL%)

echo ✨ [SUCCESS] Data reset complete. Schema preserved!
pause