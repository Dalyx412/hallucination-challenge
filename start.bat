@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-ngrok.ps1"
if errorlevel 1 (
  echo.
  echo Start failed. Press any key to close.
  pause >nul
)
