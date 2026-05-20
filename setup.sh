#!/usr/bin/env bash
# =============================================================================
# AI Creative Studio - One-Command Local Setup (macOS / Linux)
# =============================================================================
# Usage:   bash setup.sh   (or: chmod +x setup.sh && ./setup.sh)
# Idempotent: re-runs are safe. Already-configured items are skipped.
# =============================================================================

set -e

# --- styling -----------------------------------------------------------------
C_MAGENTA=$'\033[35m'
C_CYAN=$'\033[36m'
C_GREEN=$'\033[32m'
C_YELLOW=$'\033[33m'
C_RED=$'\033[31m'
C_BLUE=$'\033[34m'
C_GRAY=$'\033[90m'
C_RESET=$'\033[0m'

banner()    { printf "\n${C_MAGENTA}  +-----------------------------------------------------------+\n  |        AI Creative Studio - Local Setup                   |\n  +-----------------------------------------------------------+${C_RESET}\n\n"; }
step()      { printf "\n${C_CYAN}>> %s${C_RESET}\n" "$1"; }
ok()        { printf "${C_GREEN}   [OK]   %s${C_RESET}\n" "$1"; }
skip()      { printf "${C_GRAY}   [SKIP] %s${C_RESET}\n" "$1"; }
warn()      { printf "${C_YELLOW}   [WARN] %s${C_RESET}\n" "$1"; }
fail()      { printf "${C_RED}   [FAIL] %s${C_RESET}\n" "$1"; }
info()      { printf "${C_GRAY}          %s${C_RESET}\n" "$1"; }
hint()      { printf "${C_YELLOW}          %s${C_RESET}\n" "$1"; }
link()      { printf "${C_BLUE}          %s${C_RESET}\n" "$1"; }

# --- env file helpers --------------------------------------------------------
get_env_value() {
    local key=$1
    [[ -f .env.local ]] || { echo ""; return; }
    # Match KEY=VALUE, trim surrounding quotes/whitespace
    local v
    v=$(grep -E "^${key}=" .env.local | head -1 | sed -E "s/^${key}=//; s/^[\"']//; s/[\"']$//; s/^[[:space:]]*//; s/[[:space:]]*$//")
    echo "$v"
}

set_env_value() {
    local key=$1
    local value=$2
    local tmp
    tmp=$(mktemp)
    local found=0
    if [[ -f .env.local ]]; then
        while IFS= read -r line || [[ -n $line ]]; do
            if [[ $line =~ ^${key}= ]]; then
                printf "%s=%s\n" "$key" "$value" >> "$tmp"
                found=1
            else
                printf "%s\n" "$line" >> "$tmp"
            fi
        done < .env.local
    fi
    if [[ $found -eq 0 ]]; then
        printf "%s=%s\n" "$key" "$value" >> "$tmp"
    fi
    mv "$tmp" .env.local
}

is_placeholder() {
    local v=$1
    [[ -z $v ]] && return 0
    case "$v" in
        your_gemini_api_key_here|your_supabase_anon_key_here|"https://your-project-id.supabase.co") return 0 ;;
        *) return 1 ;;
    esac
}

# --- input helpers -----------------------------------------------------------
# Args: prompt, validator-regex, error-hint
read_required() {
    local prompt=$1
    local regex=$2
    local error_hint=$3
    local val=""
    while true; do
        printf "${C_GRAY}          > %s: ${C_RESET}" "$prompt"
        IFS= read -r val
        val=$(echo "$val" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')
        if [[ -z $val ]]; then
            fail "Input cannot be empty."
            continue
        fi
        if [[ $val =~ $regex ]]; then
            printf "%s" "$val"
            return 0
        fi
        fail "$error_hint"
    done
}

# =============================================================================
# MAIN
# =============================================================================
banner

# --- 1. Sanity: project root -------------------------------------------------
step "Verifying project root"
if [[ ! -f package.json ]]; then
    fail "package.json not found in current directory."
    info "Run this from the AI Creative Studio project root."
    exit 1
fi
if ! grep -q '"name": "ai-creative-studio"' package.json; then
    warn "package.json doesn't look like ai-creative-studio."
    info "Continuing anyway -- script may misbehave in the wrong directory."
fi
ok "Found AI Creative Studio project"

# --- 2. Node.js check --------------------------------------------------------
step "Checking Node.js"
if ! command -v node >/dev/null 2>&1; then
    fail "Node.js is not installed (or not in PATH)."
    info "Install Node.js LTS:"
    case "$(uname -s)" in
        Darwin) link "  brew install node    (or download below)" ;;
    esac
    link "  https://nodejs.org"
    exit 1
fi
NODE_VER=$(node --version)
NODE_MAJOR=$(echo "$NODE_VER" | sed -E 's/v([0-9]+).*/\1/')
if [[ $NODE_MAJOR -lt 18 ]]; then
    fail "Node.js $NODE_VER detected. Need v18 or higher."
    info "Upgrade Node.js:"
    link "  https://nodejs.org"
    exit 1
fi
ok "Node.js $NODE_VER"

# --- 3. Bootstrap .env.local --------------------------------------------------
step "Checking .env.local"
if [[ ! -f .env.local ]]; then
    if [[ ! -f .env.example ]]; then
        fail ".env.example missing -- cannot bootstrap .env.local"
        exit 1
    fi
    cp .env.example .env.local
    ok "Created .env.local from .env.example"
else
    skip ".env.local already exists"
fi

# --- 4. Gemini API key -------------------------------------------------------
step "Checking Gemini API key"
GEMINI_KEY=$(get_env_value GEMINI_API_KEY)
if is_placeholder "$GEMINI_KEY"; then
    echo ""
    hint "About your Gemini API key:"
    info "This app uses 'gemini-3-pro-image-preview' (Nano Banana Pro)."
    info ""
    info "  Free tier keys  -> work for Flash text models, but NOT for"
    info "                     image generation (this app will fail)."
    info "  Paid tier keys  -> required. Image gen costs roughly"
    info "                     \$0.15-\$0.25 per generation."
    info ""
    info "Steps:"
    info "  1. Enable billing on a GCP project:"
    link "     https://ai.google.dev/gemini-api/docs/billing"
    info "  2. Generate the key (links it to your billed project):"
    link "     https://aistudio.google.com/app/apikey"
    echo ""

    GEMINI_KEY=$(read_required "Paste Gemini API key" '^AIza[A-Za-z0-9_-]{30,}$' \
        "Key must start with 'AIza' and be ~39 characters long.")
    set_env_value GEMINI_API_KEY "$GEMINI_KEY"
    ok "Gemini API key saved"
else
    PREFIX=$(echo "$GEMINI_KEY" | cut -c1-6)
    skip "GEMINI_API_KEY already set (starts with ${PREFIX}...)"
fi

# --- 5. App mode (local vs cloud) --------------------------------------------
step "Checking app mode"
APP_ENV=$(get_env_value APP_ENV)
[[ -z $APP_ENV ]] && APP_ENV="development"

SUPA_URL=$(get_env_value SUPABASE_URL)
SUPA_KEY=$(get_env_value SUPABASE_ANON_KEY)
CLOUD_READY=1
is_placeholder "$SUPA_URL" && CLOUD_READY=0
is_placeholder "$SUPA_KEY" && CLOUD_READY=0

if [[ $APP_ENV == "production" && $CLOUD_READY -eq 0 ]]; then
    echo ""
    hint "APP_ENV=production but Supabase keys are missing."
    info ""
    info "  Local mode  -> SQLite + local filesystem. Fastest setup."
    info "                 Single machine, no sign-up needed."
    info "  Cloud mode  -> Supabase DB + Storage. Share across"
    info "                 devices/teams. Needs a Supabase project."
    info ""

    printf "${C_GRAY}          > Configure cloud mode now? [y/N]: ${C_RESET}"
    IFS= read -r choice
    if [[ $choice =~ ^[yY] ]]; then
        echo ""
        hint "Find these in: Supabase dashboard -> Project Settings -> API"
        info ""

        SUPA_URL=$(read_required "Supabase Project URL" '^https://[a-z0-9]+\.supabase\.co/?$' \
            "Must look like: https://abcxyz.supabase.co")
        SUPA_URL="${SUPA_URL%/}"

        SUPA_KEY=$(read_required "Supabase anon/public key" '^eyJ[A-Za-z0-9._-]{50,}$' \
            "anon key is a long JWT starting with 'eyJ'.")

        set_env_value SUPABASE_URL "$SUPA_URL"
        set_env_value SUPABASE_ANON_KEY "$SUPA_KEY"
        ok "Supabase credentials saved"

        echo ""
        hint "Don't forget to run the SQL setup in Supabase!"
        info "See README.md -> Supabase Setup -> 'Run SQL Setup'."
    else
        set_env_value APP_ENV "development"
        APP_ENV="development"
        ok "Switched APP_ENV to 'development' (local mode)"
    fi
else
    skip "Running in $APP_ENV mode"
fi

# --- 6. Dependencies ---------------------------------------------------------
step "Checking npm dependencies"
NEED_INSTALL=0
if [[ ! -d node_modules ]]; then
    NEED_INSTALL=1
    info "node_modules missing"
elif [[ package-lock.json -nt node_modules ]]; then
    NEED_INSTALL=1
    info "package-lock.json is newer than node_modules"
fi

if [[ $NEED_INSTALL -eq 1 ]]; then
    info "Running 'npm install' (1-2 minutes)..."
    if ! npm install --no-fund --no-audit --silent; then
        fail "npm install failed"
        exit 1
    fi
    ok "Dependencies installed"
else
    skip "Dependencies already installed"
fi

# --- 7. Database (local mode only) -------------------------------------------
if [[ $APP_ENV != "production" ]]; then
    step "Setting up local database"
    export DATABASE_URL="file:./dev.db"
    DB_EXISTED=0
    [[ -f dev.db ]] && DB_EXISTED=1

    if ! npx prisma migrate deploy >/dev/null 2>&1; then
        fail "prisma migrate deploy failed"
        info "Try running manually:"
        link "  npx prisma migrate deploy"
        exit 1
    fi

    if ! npx prisma generate >/dev/null 2>&1; then
        warn "prisma generate emitted warnings (non-fatal)"
    fi

    if [[ $DB_EXISTED -eq 1 ]]; then
        skip "Database already initialized (dev.db)"
    else
        ok "Database initialized (dev.db)"
    fi
else
    skip "Cloud mode -- skipping local database setup"
fi

# --- 8. Storage directory (local mode only) ----------------------------------
if [[ $APP_ENV != "production" ]]; then
    step "Checking storage directory"
    STORAGE_PATH=$(get_env_value LOCAL_STORAGE_PATH)
    [[ -z $STORAGE_PATH ]] && STORAGE_PATH="./storage/creatives"
    if [[ ! -d $STORAGE_PATH ]]; then
        mkdir -p "$STORAGE_PATH"
        ok "Created $STORAGE_PATH"
    else
        skip "Storage directory exists"
    fi
fi

# --- 9. Recap & start --------------------------------------------------------
echo ""
printf "${C_GREEN}  +-----------------------------------------------------------+\n  |   Setup complete!                                         |\n  +-----------------------------------------------------------+${C_RESET}\n\n"
hint "Heads-up before you go:"
info "* Auth is BYPASSED in development (BYPASS_AUTH=true in App.tsx)."
info "  To enable Google Sign-In, see GOOGLE_AUTH_SETUP.md."
info ""
info "* Parallel generation default: GENERATION_CONCURRENCY=5"
info "  (5 Gemini calls in parallel per batch -- ~6x faster than serial)."
info "  Lower it in .env.local if your Gemini quota gets tight."
info ""
info "* Image generation costs (paid tier):"
info "  ~\$0.15-\$0.25 per image on gemini-3-pro-image-preview."
echo ""
printf "${C_CYAN}  Starting dev server at http://localhost:3000 ...${C_RESET}\n"
printf "${C_GRAY}  (Press Ctrl+C to stop)${C_RESET}\n\n"

if [[ $APP_ENV == "production" ]]; then
    npm run dev:prod
else
    npm run dev
fi
