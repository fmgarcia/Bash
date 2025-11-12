@echo off
title Iniciando Proyecto FullStack

echo Iniciando Backend...
start "" /MIN cmd /c "cd backend && npm install && npm run dev"

echo Iniciando Frontend...
start "" /MIN cmd /c "cd frontend && npm install && npm run dev"

echo ==============================================
echo ✅ Backend y Frontend se han iniciado.
echo ✅ Puedes cerrar esta ventana, no afecta al proceso.
echo ==============================================
pause >nul