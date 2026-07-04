@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-challenge.ps1"
if errorlevel 1 (
  echo.
  echo Stop failed. Press any key to close.
  pause >nul
)
