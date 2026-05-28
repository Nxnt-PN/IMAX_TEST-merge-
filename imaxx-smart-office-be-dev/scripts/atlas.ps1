param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]] $AtlasArgs
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$localAtlas = Join-Path $projectRoot "tools\atlas\atlas.exe"
$localAtlasLatest = Join-Path $projectRoot "tools\atlas\atlas-windows-amd64-latest.exe"

if (Test-Path $localAtlas) {
  & $localAtlas @AtlasArgs
  exit $LASTEXITCODE
}

if (Test-Path $localAtlasLatest) {
  & $localAtlasLatest @AtlasArgs
  exit $LASTEXITCODE
}

& atlas @AtlasArgs
exit $LASTEXITCODE
