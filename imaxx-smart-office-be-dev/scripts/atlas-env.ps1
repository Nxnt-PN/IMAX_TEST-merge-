$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/imaxx_office?search_path=public&sslmode=disable"
$env:GOCACHE = Join-Path (Resolve-Path ".").Path ".gocache"

if (Test-Path ".\tools\atlas\atlas.exe") {
  $env:PATH = "$(Join-Path (Resolve-Path '.').Path 'tools\atlas');$env:PATH"
}

Write-Host "Atlas environment loaded for local Postgres on localhost:5432."
Write-Host "Try: atlas migrate status --env local"
