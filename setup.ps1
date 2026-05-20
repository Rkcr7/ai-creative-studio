# =============================================================================
# AI Creative Studio - One-Command Local Setup (Windows / PowerShell)
# =============================================================================
# Usage:  powershell -ExecutionPolicy Bypass -File setup.ps1
# Idempotent: re-runs are safe. Already-configured items are skipped.
# =============================================================================

$ErrorActionPreference = "Stop"

# --- styling -----------------------------------------------------------------
function Write-Banner {
    Write-Host ""
    Write-Host "  +-----------------------------------------------------------+" -ForegroundColor Magenta
    Write-Host "  |        AI Creative Studio - Local Setup                   |" -ForegroundColor Magenta
    Write-Host "  +-----------------------------------------------------------+" -ForegroundColor Magenta
    Write-Host ""
}
function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "   [OK]   $msg" -ForegroundColor Green }
function Write-Skip($msg) { Write-Host "   [SKIP] $msg" -ForegroundColor DarkGray }
function Write-Warn($msg) { Write-Host "   [WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "   [FAIL] $msg" -ForegroundColor Red }
function Write-Info($msg) { Write-Host "          $msg" -ForegroundColor DarkGray }
function Write-Hint($msg) { Write-Host "          $msg" -ForegroundColor Yellow }
function Write-Link($msg) { Write-Host "          $msg" -ForegroundColor Blue }

# --- env file helpers --------------------------------------------------------
function Get-EnvValue($key) {
    if (-not (Test-Path ".env.local")) { return $null }
    $line = Select-String -Path ".env.local" -Pattern "^$key=" -SimpleMatch:$false | Select-Object -First 1
    if (-not $line) { return $null }
    $val = $line.Line -replace "^$key=", ""
    return $val.Trim('"', "'", ' ')
}

function Set-EnvValue($key, $value) {
    $content = Get-Content ".env.local" -Raw
    if ($content -match "(?m)^$key=") {
        # Update existing line -- `$1` referenced inline below, no escaping needed.
        $content = [regex]::Replace($content, "(?m)^$key=.*$", "$key=$value")
    } else {
        if (-not $content.EndsWith("`n")) { $content += "`n" }
        $content += "$key=$value`n"
    }
    Set-Content ".env.local" -Value $content -NoNewline
}

function Test-Placeholder($value) {
    if (-not $value) { return $true }
    $placeholders = @(
        'your_gemini_api_key_here',
        'your_supabase_anon_key_here',
        'https://your-project-id.supabase.co',
        ''
    )
    return $placeholders -contains $value
}

# --- input helpers -----------------------------------------------------------
function Read-Required($promptText, $validator, $errorHint) {
    while ($true) {
        $val = (Read-Host "          > $promptText").Trim()
        if (-not $val) {
            Write-Err "Input cannot be empty."
            continue
        }
        if (& $validator $val) { return $val }
        Write-Err $errorHint
    }
}

# =============================================================================
# MAIN
# =============================================================================
Write-Banner

# --- 1. Sanity: are we in the project root? ----------------------------------
Write-Step "Verifying project root"
if (-not (Test-Path "package.json")) {
    Write-Err "package.json not found in current directory."
    Write-Info "Run this from the AI Creative Studio project root."
    exit 1
}
$pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($pkg.name -ne "ai-creative-studio") {
    Write-Warn "package.json name is '$($pkg.name)', expected 'ai-creative-studio'."
    Write-Info "Continuing anyway -- script may misbehave in the wrong directory."
}
Write-Ok "Found AI Creative Studio project"

# --- 2. Node.js check --------------------------------------------------------
Write-Step "Checking Node.js"
try {
    $nodeVer = node --version 2>$null
    $major = [int]([regex]::Match($nodeVer, 'v(\d+)').Groups[1].Value)
    if ($major -lt 18) {
        Write-Err "Node.js $nodeVer detected. Need v18 or higher."
        Write-Info "Download Node.js LTS:"
        Write-Link "  https://nodejs.org"
        exit 1
    }
    Write-Ok "Node.js $nodeVer"
} catch {
    Write-Err "Node.js is not installed (or not in PATH)."
    Write-Info "Download Node.js LTS:"
    Write-Link "  https://nodejs.org"
    exit 1
}

# --- 3. Bootstrap .env.local --------------------------------------------------
Write-Step "Checking .env.local"
if (-not (Test-Path ".env.local")) {
    if (-not (Test-Path ".env.example")) {
        Write-Err ".env.example missing -- cannot bootstrap .env.local"
        exit 1
    }
    Copy-Item ".env.example" ".env.local"
    Write-Ok "Created .env.local from .env.example"
} else {
    Write-Skip ".env.local already exists"
}

# --- 4. Gemini API key -------------------------------------------------------
Write-Step "Checking Gemini API key"
$geminiKey = Get-EnvValue "GEMINI_API_KEY"
if (Test-Placeholder $geminiKey) {
    Write-Host ""
    Write-Hint "About your Gemini API key:"
    Write-Info "This app uses 'gemini-3-pro-image-preview' (Nano Banana Pro)."
    Write-Info ""
    Write-Info "  Free tier keys  -> work for Flash text models, but NOT for"
    Write-Info "                     image generation (this app will fail)."
    Write-Info "  Paid tier keys  -> required. Image gen costs roughly"
    Write-Info "                     `$0.15-`$0.25 per generation."
    Write-Info ""
    Write-Info "Steps:"
    Write-Info "  1. Enable billing on a GCP project:"
    Write-Link "     https://ai.google.dev/gemini-api/docs/billing"
    Write-Info "  2. Generate the key (links it to your billed project):"
    Write-Link "     https://aistudio.google.com/app/apikey"
    Write-Host ""

    $geminiKey = Read-Required "Paste Gemini API key" {
        param($v); return $v.StartsWith("AIza") -and $v.Length -ge 35
    } "Key must start with 'AIza' and be ~39 chars long."
    Set-EnvValue "GEMINI_API_KEY" $geminiKey
    Write-Ok "Gemini API key saved"
} else {
    Write-Skip "GEMINI_API_KEY already set (starts with $($geminiKey.Substring(0, 6))...)"
}

# --- 5. App mode (local vs cloud) --------------------------------------------
Write-Step "Checking app mode"
$appEnv = Get-EnvValue "APP_ENV"
if (-not $appEnv) { $appEnv = "development" }

$supaUrl = Get-EnvValue "SUPABASE_URL"
$supaKey = Get-EnvValue "SUPABASE_ANON_KEY"
$cloudReady = (-not (Test-Placeholder $supaUrl)) -and (-not (Test-Placeholder $supaKey))

if ($appEnv -eq "production" -and -not $cloudReady) {
    Write-Host ""
    Write-Hint "APP_ENV=production but Supabase keys are missing."
    Write-Info ""
    Write-Info "  Local mode  -> SQLite + local filesystem. Fastest setup."
    Write-Info "                 Single machine, no sign-up needed."
    Write-Info "  Cloud mode  -> Supabase DB + Storage. Share across"
    Write-Info "                 devices/teams. Needs a Supabase project."
    Write-Info ""

    $choice = (Read-Host "          > Configure cloud mode now? [y/N]").Trim()
    if ($choice -match '^[yY]') {
        Write-Host ""
        Write-Hint "Find these in: Supabase dashboard -> Project Settings -> API"
        Write-Info ""

        $supaUrl = Read-Required "Supabase Project URL" {
            param($v); return $v -match '^https://[a-z0-9]+\.supabase\.co/?$'
        } "Must look like: https://abcxyz.supabase.co"
        $supaUrl = $supaUrl.TrimEnd('/')

        $supaKey = Read-Required "Supabase anon/public key" {
            param($v); return $v.StartsWith("eyJ") -and $v.Length -gt 100
        } "anon key is a long JWT starting with 'eyJ'."

        Set-EnvValue "SUPABASE_URL" $supaUrl
        Set-EnvValue "SUPABASE_ANON_KEY" $supaKey
        Write-Ok "Supabase credentials saved"

        Write-Host ""
        Write-Hint "Don't forget to run the SQL setup in Supabase!"
        Write-Info "See README.md -> Supabase Setup -> 'Run SQL Setup'."
    } else {
        Set-EnvValue "APP_ENV" "development"
        $appEnv = "development"
        Write-Ok "Switched APP_ENV to 'development' (local mode)"
    }
} else {
    Write-Skip "Running in $appEnv mode"
}

# --- 6. Dependencies ---------------------------------------------------------
Write-Step "Checking npm dependencies"
$needInstall = $false
if (-not (Test-Path "node_modules")) {
    $needInstall = $true
    Write-Info "node_modules missing"
} else {
    $lockTime = (Get-Item "package-lock.json" -ErrorAction SilentlyContinue).LastWriteTime
    $nmTime   = (Get-Item "node_modules" -ErrorAction SilentlyContinue).LastWriteTime
    if ($lockTime -and $nmTime -and $lockTime -gt $nmTime) {
        $needInstall = $true
        Write-Info "package-lock.json is newer than node_modules"
    }
}

if ($needInstall) {
    Write-Info "Running 'npm install' (1-2 minutes)..."
    npm install --no-fund --no-audit --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Err "npm install failed (exit $LASTEXITCODE)"
        exit 1
    }
    Write-Ok "Dependencies installed"
} else {
    Write-Skip "Dependencies already installed"
}

# --- 7. Database (local mode only) -------------------------------------------
if ($appEnv -ne "production") {
    Write-Step "Setting up local database"
    $env:DATABASE_URL = "file:./dev.db"
    $dbExisted = Test-Path "dev.db"

    # PS 5.1 wraps native stderr as ErrorRecord under ErrorActionPreference=Stop,
    # even with `2>$null`. Isolate the call via `cmd /c` so PowerShell never sees
    # the native streams — it only sees the final exit code of cmd.exe.
    cmd /c "npx prisma migrate deploy >nul 2>&1"
    if ($LASTEXITCODE -ne 0) {
        Write-Err "prisma migrate deploy failed (exit $LASTEXITCODE)"
        Write-Info "Try running manually to see the error:"
        Write-Link "  npx prisma migrate deploy"
        exit 1
    }

    cmd /c "npx prisma generate >nul 2>&1"
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "prisma generate emitted warnings (non-fatal)"
    }

    if ($dbExisted) {
        Write-Skip "Database already initialized (dev.db)"
    } else {
        Write-Ok "Database initialized (dev.db)"
    }
} else {
    Write-Skip "Cloud mode -- skipping local database setup"
}

# --- 8. Storage directory (local mode only) ----------------------------------
if ($appEnv -ne "production") {
    Write-Step "Checking storage directory"
    $storagePath = Get-EnvValue "LOCAL_STORAGE_PATH"
    if (-not $storagePath) { $storagePath = "./storage/creatives" }
    if (-not (Test-Path $storagePath)) {
        New-Item -ItemType Directory -Path $storagePath -Force | Out-Null
        Write-Ok "Created $storagePath"
    } else {
        Write-Skip "Storage directory exists"
    }
}

# --- 9. Recap & start --------------------------------------------------------
Write-Host ""
Write-Host "  +-----------------------------------------------------------+" -ForegroundColor Green
Write-Host "  |   Setup complete!                                         |" -ForegroundColor Green
Write-Host "  +-----------------------------------------------------------+" -ForegroundColor Green
Write-Host ""
Write-Hint "Heads-up before you go:"
Write-Info "* Auth is BYPASSED in development (BYPASS_AUTH=true in App.tsx)."
Write-Info "  To enable Google Sign-In, see GOOGLE_AUTH_SETUP.md."
Write-Info ""
Write-Info "* Parallel generation default: GENERATION_CONCURRENCY=5"
Write-Info "  (5 Gemini calls in parallel per batch -- ~6x faster than serial)."
Write-Info "  Lower it in .env.local if your Gemini quota gets tight."
Write-Info ""
Write-Info "* Image generation costs (paid tier):"
Write-Info "  ~`$0.15-`$0.25 per image on gemini-3-pro-image-preview."
Write-Host ""
Write-Host "  Starting dev server at http://localhost:3000 ..." -ForegroundColor Cyan
Write-Host "  (Press Ctrl+C to stop)" -ForegroundColor DarkGray
Write-Host ""

if ($appEnv -eq "production") {
    npm run dev:prod
} else {
    npm run dev
}
