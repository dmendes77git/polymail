@echo off
title Bom Sucesso Mailing App
echo ===================================================
echo   Iniciando o Bom Sucesso Mailing App...
echo ===================================================
echo.

start "" "http://localhost:8080"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"

pause
