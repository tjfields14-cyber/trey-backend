Write-Host ""
Write-Host "=== STARTING PEARL.ai RUNTIME ==="
Write-Host ""

# Activate Python Environment
& ".\.venv\Scripts\Activate.ps1"

# Start FastAPI Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; uvicorn backend.src.app:app --reload"

# Start WebSocket Runtime
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; python backend/src/websocket.py"

# Start Portal Runtime
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\\portal\\aura-portal'; npm run dev"

Write-Host ""
Write-Host "PEARL.ai runtime online."
Write-Host ""