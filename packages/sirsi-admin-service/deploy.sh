#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Sirsi Admin Service — Cloud Run Deploy Script
# ═══════════════════════════════════════════════════════════════════
#
# Deploys the sirsi-admin ConnectRPC service to Cloud Run.
#
# Usage:
#   ./deploy.sh              # Deploy with defaults
#   ./deploy.sh --no-vendor  # Skip re-vendoring (faster if vendor/ is current)
#
# Prerequisites:
#   - gcloud CLI authenticated to sirsi-nexus-live
#   - pip3 install grpcio   (if gcloud complains about missing grpc)
#
# NOTE: Uses `yes |` to prevent "Aborted by user" errors.
#       gcloud run deploy --source is a long-running interactive command.
#       Without a persistent stdin, gcloud self-aborts mid-build.
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Config ─────────────────────────────────────────────────────────
SERVICE_NAME="sirsi-admin"
REGION="us-central1"
PROJECT="sirsi-nexus-live"
PORT="8080"
MEMORY="256Mi"
CPU="1"
MIN_INSTANCES="0"
MAX_INSTANCES="10"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colors ─────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# ── Pre-flight checks ─────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Sirsi Admin Service — Cloud Run Deploy"
echo "═══════════════════════════════════════════════════════"
echo ""

# Verify gcloud
command -v gcloud &>/dev/null || error "gcloud CLI not found. Install: https://cloud.google.com/sdk/"

# Verify project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT" ]; then
    error "gcloud project is '$CURRENT_PROJECT', expected '$PROJECT'. Run: gcloud config set project $PROJECT"
fi
info "Project: $PROJECT"

# ── Step 1: Build locally to catch errors before Cloud Build ──────
info "Building locally to verify..."
cd "$SCRIPT_DIR"
go build -o sirsi-admin . 2>&1 || error "Local build failed. Fix errors before deploying."
rm -f sirsi-admin  # Clean up local binary
info "Local build: OK"

# ── Step 2: Re-vendor dependencies (unless --no-vendor) ───────────
if [[ "${1:-}" != "--no-vendor" ]]; then
    info "Vendoring dependencies..."
    GOWORK=off GOTOOLCHAIN=local go mod tidy 2>&1
    GOWORK=off GOTOOLCHAIN=local go mod vendor 2>&1
    info "Vendor: OK"
else
    warn "Skipping vendor (--no-vendor flag)"
fi

# ── Step 3: Verify go.mod version is Docker-compatible ────────────
GO_VERSION=$(grep "^go " go.mod | awk '{print $2}')
info "go.mod version: $GO_VERSION"

# Check the version is available on Docker Hub (1.24.x max as of Mar 2026)
MAJOR_MINOR=$(echo "$GO_VERSION" | cut -d. -f1,2)
if [[ "$MAJOR_MINOR" > "1.24" ]]; then
    error "go.mod requires go $GO_VERSION but Docker Hub only has up to golang:1.24-alpine. Lower the version with: sed -i '' 's/go $GO_VERSION/go 1.24.0/' go.mod"
fi

# ── Step 4: Deploy to Cloud Run ───────────────────────────────────
echo ""
info "Deploying to Cloud Run ($REGION)..."
echo "  Service:  $SERVICE_NAME"
echo "  Region:   $REGION"
echo "  Memory:   $MEMORY"
echo "  CPU:      $CPU"
echo "  Min/Max:  $MIN_INSTANCES / $MAX_INSTANCES"
echo ""

# CRITICAL: `yes |` keeps stdin alive during the multi-minute build.
# Without it, gcloud aborts with "Aborted by user" when stdin closes.
yes | gcloud run deploy "$SERVICE_NAME" \
    --source "$SCRIPT_DIR" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --port "$PORT" \
    --memory "$MEMORY" \
    --cpu "$CPU" \
    --min-instances "$MIN_INSTANCES" \
    --max-instances "$MAX_INSTANCES" 2>&1

# ── Step 5: Verify deployment ─────────────────────────────────────
echo ""
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format="value(status.url)" 2>/dev/null)

if [ -z "$SERVICE_URL" ]; then
    error "Deployment verification failed — service URL not found"
fi

info "Service URL: $SERVICE_URL"

# Health check
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H 'Content-Type: application/json' \
    -d '{}' \
    "$SERVICE_URL/sirsi.admin.v2.HypervisorService/GetHypervisorOverview" 2>/dev/null)

if [ "$RESPONSE" == "200" ]; then
    info "Health check: 200 OK ✓"
else
    warn "Health check returned HTTP $RESPONSE (may still be booting)"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Deploy complete: $SERVICE_URL"
echo "═══════════════════════════════════════════════════════"
echo ""
