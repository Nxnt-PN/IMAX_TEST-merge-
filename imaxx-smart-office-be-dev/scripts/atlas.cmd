@echo off
setlocal
set PROJECT_ROOT=%~dp0..
if exist "%PROJECT_ROOT%\tools\atlas\atlas.exe" (
  "%PROJECT_ROOT%\tools\atlas\atlas.exe" %*
) else if exist "%PROJECT_ROOT%\tools\atlas\atlas-windows-amd64-latest.exe" (
  "%PROJECT_ROOT%\tools\atlas\atlas-windows-amd64-latest.exe" %*
) else (
  atlas %*
)
exit /b %ERRORLEVEL%
