#!/usr/bin/env bash
# resume-migration.sh
# Continue migration phases after removing /sirsinexusportal/ paths.
# Safe by default: read-only checks unless flags are provided.
# Usage:
#   bash scripts/resume-migration.sh [--prod] [--deploy] [--fix-verify-scripts] [--skip-local]
# Options:
#   --prod                Include production checks against https://sirsi.ai
#   --deploy              Run optional deployment hooks if present
#   --fix-verify-scripts  Update legacy verification scripts to root paths (in-place)
#   --skip-local          Skip local http.server checks (useful on CI)
#   --help                Show help

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err() { echo -e "${RED}[ERR]${NC} $*"; }
step() { echo -e "\n${YELLOW}==>${NC} $*"; }

INCLUDE_PROD=false
RUN_DEPLOY=false
FIX_VERIFY=false
SKIP_LOCAL=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod) INCLUDE_PROD=true; shift ;;
    --deploy) RUN_DEPLOY=true; shift ;;
    --fix-verify-scripts) FIX_VERIFY=true; shift ;;
    --skip-local) SKIP_LOCAL=true; shift ;;
    --help)
      sed -n '1,40p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) warn "Unknown option: $1"; shift ;;
  esac
done

PHASE_SUMMARY=()
add_summary() { PHASE_SUMMARY+=("$1"); }
print_summary() {
  echo "\nSummary:"; for s in "${PHASE_SUMMARY[@]}"; do echo " - $s"; done
}

check_cmd() {
  command -v "$1" >/dev/null 2>&1 || { err "Missing dependency: $1"; exit 1; }
}

step "Phase 1: Repo state and branch"
check_cmd git
BRANCH=$(git rev-parse --abbrev-ref HEAD)
STATUS=$(git status --porcelain)
log "On branch: $BRANCH"
if [[ -n "$STATUS" ]]; then warn "Working tree has uncommitted changes"; else log "Working tree clean"; fi
add_summary "Repo checked (branch=$BRANCH)"

step "Phase 2: Path scrub verification"
EXCLUDES=("--exclude-dir=archive" "--exclude-dir=node_modules" "--exclude-dir=.git" "--exclude-dir=.firebase")
# Remaining references to /sirsinexusportal/
if grep -RIn "\/sirsinexusportal\/" . "${EXCLUDES[@]}" | grep -v ".firebase/hosting..cache" | grep -v "^Binary file" >/tmp/path_refs.txt 2>/dev/null; then
  warn "Found remaining references to /sirsinexusportal/:"
  sed -n '1,200p' /tmp/path_refs.txt
  add_summary "Remaining sirsinexusportal refs found (review /tmp/path_refs.txt)"
else
  log "No active references to /sirsinexusportal/ found (excluding archives and cache)"
  add_summary "Active path refs clean"
fi

step "Phase 3: Redirect rules sanity"
if [[ -f _redirects ]]; then
  # Ensure no destinations point to /sirsinexusportal/ and that a catch-all exists
  if grep -E "^[^#].*\s+/sirsinexusportal/" _redirects >/dev/null; then
    warn "_redirects has destinations pointing to /sirsinexusportal/.";
  else
    log "_redirects destinations are clean"
  fi
  if grep -q "^/sirsinexusportal/\*\s+/:splat\s+301" _redirects; then
    log "Catch-all legacy redirect present"
  else
    warn "Catch-all legacy redirect missing: add '/sirsinexusportal/*  /:splat  301' if needed"
  fi
  add_summary "_redirects checked"
else
  warn "_redirects not found"
  add_summary "_redirects missing"
fi

step "Phase 4: PWA manifest checks"
MANIFEST="sirsinexusportal/manifest.webmanifest"
if [[ -f "$MANIFEST" ]]; then
  if grep -q '"start_url"\s*:\s*"/pay.html"' "$MANIFEST" && \
     grep -q '"scope"\s*:\s*"/"' "$MANIFEST" && \
     grep -q '"src"\s*:\s*"/assets/images/' "$MANIFEST"; then
    log "Manifest uses root-level paths"
  else
    warn "Manifest may still reference /sirsinexusportal/. Please review: $MANIFEST"
  fi
  add_summary "Manifest checked"
else
  warn "Manifest not found at $MANIFEST"
  add_summary "Manifest missing"
fi

step "Phase 5: Security headers (local and optional prod)"
check_cmd curl
HEADERS_FILE="firebase-hosting-headers.json"
if [[ -f "$HEADERS_FILE" ]]; then log "Headers config present: $HEADERS_FILE"; else warn "Headers config missing: $HEADERS_FILE"; fi

LOCAL_URLS=(
  "http://localhost:8000/index.html"
  "http://localhost:8000/admin/index.html"
  "http://localhost:8000/investor-portal/"
)

SERVER_PID=""
if ! $SKIP_LOCAL; then
  check_cmd python3
  step "Starting local server (python3 -m http.server 8000)"
  python3 -m http.server 8000 >/dev/null 2>&1 & SERVER_PID=$!
  sleep 1
  trap '[[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
  for u in "${LOCAL_URLS[@]}"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$u" || true)
    if [[ "$code" =~ ^2|3 ]]; then log "Local reachable: $u ($code)"; else warn "Local failed: $u ($code)"; fi
  done
  add_summary "Local server checks complete"
else
  warn "Skipping local server checks (--skip-local)"
fi

if $INCLUDE_PROD; then
  step "Production checks (sirsi.ai)"
  PROD_URLS=(
    "https://sirsi.ai/index.html"
    "https://sirsi.ai/admin/index.html"
    "https://sirsi.ai/investor-portal/"
    "https://sirsi.ai/investor-login.html"
  )
  for u in "${PROD_URLS[@]}"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$u" || true)
    if [[ "$code" =~ ^2|3 ]]; then log "Prod reachable: $u ($code)"; else warn "Prod failed: $u ($code)"; fi
  done
  # Header spot check
  curl -sI https://sirsi.ai/ | awk 'NR<=20{print}'
  add_summary "Prod checks complete"
fi

step "Phase 6: Optional: fix legacy verify scripts"
if $FIX_VERIFY; then
  FILES=(verify-deployment.sh fix-firebase-config.js check-platform-status.sh)
  for f in "${FILES[@]}"; do
    if [[ -f "$f" ]]; then
      if grep -RInq "^.*sirsinexusportal/" "$f"; then
        sed -i.bak 's#/sirsinexusportal/#/#g' "$f" || true
        sed -i.bak 's#\bsirsinexusportal/##g' "$f" || true
        rm -f "$f.bak"
        log "Updated legacy paths in $f"
      fi
    fi
  done
  add_summary "Legacy verify scripts updated"
else
  warn "Skipped updating legacy verification scripts (pass --fix-verify-scripts to update)"
  add_summary "Verify script updates skipped"
fi

step "Phase 7: Optional deployment hooks"
if $RUN_DEPLOY; then
  if [[ -x "./sirsinexusportal/deploy-safeguard.sh" ]]; then
    ./sirsinexusportal/deploy-safeguard.sh || warn "deploy-safeguard failed"
    add_summary "Ran deploy-safeguard.sh"
  else
    warn "deploy-safeguard.sh not found or not executable"
    add_summary "No deploy hook executed"
  fi
else
  warn "Deployment skipped (pass --deploy to enable)"
  add_summary "Deploy skipped"
fi

print_summary

cat <<'NEXT'

Next steps you might run:
  # Fast local verification
  bash scripts/resume-migration.sh

  # Include production checks
  bash scripts/resume-migration.sh --prod

  # Update legacy verification scripts and include production checks
  bash scripts/resume-migration.sh --fix-verify-scripts --prod

  # Trigger deployment via existing safeguard script
  bash scripts/resume-migration.sh --deploy

NEXT

