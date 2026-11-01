@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
  start "" http://127.0.0.1:8765/index.html
  py -m http.server 8765
  exit /b
)
where python >nul 2>nul
if %errorlevel% equ 0 (
  start "" http://127.0.0.1:8765/index.html
  python -m http.server 8765
  exit /b
)
echo No se encontro Python.
echo Instala Python desde https://www.python.org/downloads/ y vuelve a ejecutar este archivo.
pause
