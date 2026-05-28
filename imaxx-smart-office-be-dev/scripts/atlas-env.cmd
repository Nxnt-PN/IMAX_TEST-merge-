@echo off
set DATABASE_URL=postgres://postgres:postgres@localhost:5432/imaxx_office?search_path=public^&sslmode=disable
set GOCACHE=%CD%\.gocache
set PATH=%CD%\tools\atlas;%PATH%
echo Atlas environment loaded for local Postgres on localhost:5432.
echo Try: scripts\atlas.cmd migrate status --env local
