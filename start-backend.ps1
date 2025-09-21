# PowerShell script to start the backend server
Write-Host "🚀 Starting Professional MERN Blog Backend..." -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path ".\packages\backend"

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host "🔥 Starting backend development server..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:3001" -ForegroundColor Yellow
Write-Host "API endpoints will be at: http://localhost:3001/api" -ForegroundColor Yellow
Write-Host "" 
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Magenta

# Start the development server
npm run dev
