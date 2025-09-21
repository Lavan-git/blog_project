# Professional MERN Blog - Installation Script
# Run this script with: PowerShell -ExecutionPolicy Bypass -File install.ps1

Write-Host "🚀 Professional MERN Blog - Installation Script" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check Node.js version
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check if version is >= 20
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 20) {
        Write-Host "❌ Node.js version 20+ required. Current: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

# Check npm version
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check Docker (optional)
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker version: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker not found (optional for testing)" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install --ignore-scripts
    Write-Host "✅ Root dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install shared package dependencies
Write-Host "`n📦 Installing shared package..." -ForegroundColor Yellow
try {
    Set-Location "packages\shared"
    npm install
    npm run build
    Write-Host "✅ Shared package built" -ForegroundColor Green
    Set-Location "..\..\"
} catch {
    Write-Host "❌ Failed to build shared package" -ForegroundColor Red
    Set-Location "..\..\"
    exit 1
}

# Install backend dependencies
Write-Host "`n📦 Installing backend..." -ForegroundColor Yellow
try {
    Set-Location "packages\backend"
    npm install
    npm run build
    Write-Host "✅ Backend built" -ForegroundColor Green
    Set-Location "..\..\"
} catch {
    Write-Host "❌ Failed to build backend" -ForegroundColor Red
    Set-Location "..\..\"
    exit 1
}

# Create environment file if it doesn't exist
Write-Host "`n⚙️ Setting up environment..." -ForegroundColor Yellow
$envPath = "packages\backend\.env"
$envExamplePath = "packages\backend\.env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "✅ Created .env file from example" -ForegroundColor Green
        Write-Host "⚠️  Please update the .env file with your settings" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  No .env.example found" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host "`n🎉 Installation completed successfully!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update packages\backend\.env with your MongoDB URI and JWT secrets" -ForegroundColor White
Write-Host "2. Start MongoDB (local installation or Docker)" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start in development mode" -ForegroundColor White
Write-Host "4. Run 'npm test' to run tests" -ForegroundColor White

Write-Host "`n🔗 Available commands:" -ForegroundColor Cyan
Write-Host "npm run dev      - Start development servers" -ForegroundColor White
Write-Host "npm run build    - Build for production" -ForegroundColor White
Write-Host "npm run test     - Run all tests" -ForegroundColor White
Write-Host "npm run lint     - Lint code" -ForegroundColor White
Write-Host "npm run format   - Format code with Prettier" -ForegroundColor White

Write-Host "`n✨ Happy coding! ✨" -ForegroundColor Green
