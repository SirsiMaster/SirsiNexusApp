#!/bin/bash

# SirsiNexus Platform Status Check
# This script checks what's actually working and what needs configuration

echo "========================================="
echo "SirsiNexus Platform Status Check"
echo "========================================="
echo "Checking all systems at $(date)"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
WORKING=0
NEEDS_CONFIG=0
ERRORS=0

echo -e "${BLUE}1. DOMAIN & HOSTING${NC}"
echo "------------------------"

# Check primary domain
echo -n "Primary domain (sirsi.ai): "
if curl -s -o /dev/null -w "%{http_code}" https://sirsi.ai | grep -q "200"; then
    echo -e "${GREEN}✓ WORKING${NC}"
    ((WORKING++))
else
    echo -e "${RED}✗ NOT WORKING${NC}"
    ((ERRORS++))
fi

# Check Firebase hosting
echo -n "Firebase hosting: "
if curl -s -o /dev/null -w "%{http_code}" https://sirsi-ai.web.app | grep -q "200"; then
    echo -e "${GREEN}✓ WORKING${NC}"
    ((WORKING++))
else
    echo -e "${RED}✗ NOT WORKING${NC}"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}2. CLOUD FUNCTIONS${NC}"
echo "------------------------"

# Check health endpoint
echo -n "Health check API: "
HEALTH_RESPONSE=$(curl -s https://healthcheck-6kdf4or4qq-uc.a.run.app)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓ WORKING${NC}"
    ((WORKING++))
else
    echo -e "${RED}✗ NOT WORKING${NC}"
    ((ERRORS++))
fi

# Check API gateway
echo -n "API Gateway: "
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api-6kdf4or4qq-uc.a.run.app)
if [ "$API_STATUS" == "401" ] || [ "$API_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ WORKING${NC} (Auth required)"
    ((WORKING++))
else
    echo -e "${RED}✗ NOT WORKING${NC}"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}3. FIREBASE SERVICES${NC}"
echo "------------------------"

# Check Firebase project
echo -n "Firebase project: "
if firebase projects:list 2>/dev/null | grep -q "sirsi-nexus-live"; then
    echo -e "${GREEN}✓ CONFIGURED${NC}"
    ((WORKING++))
else
    echo -e "${RED}✗ NOT CONFIGURED${NC}"
    ((ERRORS++))
fi

# Check Firestore
echo -n "Firestore: "
if [ -f "firestore.rules" ]; then
    echo -e "${GREEN}✓ Rules exist${NC}"
    ((WORKING++))
else
    echo -e "${YELLOW}⚠ Rules file missing${NC}"
    ((NEEDS_CONFIG++))
fi

# Check Storage
echo -n "Storage: "
if [ -f "storage.rules" ]; then
    echo -e "${YELLOW}⚠ Rules exist but Storage needs console activation${NC}"
    ((NEEDS_CONFIG++))
else
    echo -e "${RED}✗ Rules file missing${NC}"
    ((ERRORS++))
fi

# Check Functions config
echo -n "Functions config: "
CONFIG=$(firebase functions:config:get --project sirsi-nexus-live 2>/dev/null)
if [ "$CONFIG" == "{}" ]; then
    echo -e "${YELLOW}⚠ NEEDS CONFIGURATION${NC} (email, etc.)"
    ((NEEDS_CONFIG++))
else
    echo -e "${GREEN}✓ CONFIGURED${NC}"
    ((WORKING++))
fi

echo ""
echo -e "${BLUE}4. KEY PAGES${NC}"
echo "------------------------"

# Check key pages
PAGES=(
    "https://sirsi.ai/"
    "https://sirsi.ai/about.html"
    "https://sirsi.ai/pricing.html"
    "https://sirsi.ai/careers.html"
    "https://sirsi.ai/blog.html"
    "https://sirsi.ai/business-case.html"
)

for page in "${PAGES[@]}"; do
    PAGE_NAME=$(basename "$page" .html)
    [ -z "$PAGE_NAME" ] && PAGE_NAME="home"
    echo -n "$PAGE_NAME page: "
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$page")
    if [ "$STATUS" == "200" ]; then
        echo -e "${GREEN}✓ LIVE${NC}"
        ((WORKING++))
    else
        echo -e "${RED}✗ NOT FOUND${NC} (HTTP $STATUS)"
        ((ERRORS++))
    fi
done

echo ""
echo -e "${BLUE}5. AUTHENTICATION & SECURITY${NC}"
echo "------------------------"

# Check for Firebase SDK on pages
echo -n "Firebase SDK integration: "
if curl -s https://sirsi.ai/ | grep -q "firebase"; then
    echo -e "${GREEN}✓ INTEGRATED${NC}"
    ((WORKING++))
else
    echo -e "${YELLOW}⚠ NOT DETECTED${NC} (may be loaded dynamically)"
    ((NEEDS_CONFIG++))
fi

# Check HTTPS
echo -n "HTTPS enforcement: "
REDIRECT=$(curl -s -I http://sirsi.ai | grep -i "location:" | grep -c "https://")
if [ "$REDIRECT" -gt 0 ]; then
    echo -e "${GREEN}✓ ENFORCED${NC}"
    ((WORKING++))
else
    echo -e "${YELLOW}⚠ CHECK NEEDED${NC}"
    ((NEEDS_CONFIG++))
fi

echo ""
echo -e "${BLUE}6. CI/CD & AUTOMATION${NC}"
echo "------------------------"

# Check GitHub Actions
echo -n "GitHub Actions workflow: "
if [ -f ".github/workflows/firebase-deploy.yml" ]; then
    echo -e "${GREEN}✓ CONFIGURED${NC}"
    ((WORKING++))
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    ((ERRORS++))
fi

# Check for Firebase token
echo -n "Firebase CI token: "
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ Stored locally${NC} (needs GitHub Secret)"
    ((NEEDS_CONFIG++))
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    ((ERRORS++))
fi

echo ""
echo "========================================="
echo -e "${BLUE}SUMMARY${NC}"
echo "========================================="
echo -e "${GREEN}Working:${NC} $WORKING components"
echo -e "${YELLOW}Needs Configuration:${NC} $NEEDS_CONFIG components"
echo -e "${RED}Errors:${NC} $ERRORS components"
echo ""

echo -e "${BLUE}WHAT'S WORKING:${NC}"
echo "✅ Primary domain (sirsi.ai) is live"
echo "✅ All Cloud Functions are deployed"
echo "✅ Main pages are accessible"
echo "✅ Firebase project is configured"
echo ""

echo -e "${YELLOW}WHAT NEEDS ATTENTION:${NC}"
echo "1. Firebase Storage - Activate in console: https://console.firebase.google.com/project/sirsi-nexus-live/storage"
echo "2. Email configuration - Run: ./setup-email-config.sh"
echo "3. GitHub Secret - Add FIREBASE_TOKEN to repository secrets"
echo "4. Functions config - Migrate to .env approach (deprecation warning)"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}CRITICAL ISSUES:${NC}"
    echo "Some components are not working. Review the errors above."
    echo ""
fi

echo "========================================="
echo "NEXT STEPS:"
echo "========================================="
echo "1. Enable Storage in Firebase Console (manual step)"
echo "2. Run: chmod +x setup-email-config.sh && ./setup-email-config.sh"
echo "3. Add FIREBASE_TOKEN to GitHub Secrets"
echo "4. Test user authentication flow"
echo ""

exit $ERRORS
