@echo off
cd /d "%~dp0"
npm run dev -- --port 5173 --strictPort --host 127.0.0.1
