# PowerShell script to start the frontend server
Write-Host "🌐 Starting Professional MERN Blog Frontend..." -ForegroundColor Green

# Navigate to frontend directory  
Set-Location -Path ".\packages\frontend"

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host "🎨 Starting frontend development server..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Note: If you get Node.js version errors, the app will still build successfully" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Magenta

# Try to start dev server, fallback to serving built version if needed
try {
    npm run dev
} catch {
    Write-Host "⚠️ Vite dev server failed due to Node.js version. Building and serving production version..." -ForegroundColor Yellow
    npm run build
    if (Get-Command "npx" -ErrorAction SilentlyContinue) {
        Write-Host "📦 Serving built application on http://localhost:3000..." -ForegroundColor Green
        npx serve dist -p 3000
    } else {
        Write-Host "✅ Build completed! Check the 'dist' folder for production files." -ForegroundColor Green
        Write-Host "To serve: Install 'serve' globally with 'npm install -g serve' then run 'serve dist'" -ForegroundColor Cyan
    }
}
