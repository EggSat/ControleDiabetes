@echo off
start "Controle Diabetes Server" /min node "%~dp0serve.cjs"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8765/"
