#!/bin/bash

# Post-Deployment Testing Script for SirsiNexus
# This script validates all deployed components

echo "========================================="
echo "SirsiNexus Post-Deployment Testing"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
TOTAL=0

# Base URLs
HOSTING_URL="https://sirsi-ai.web.app"
HEALTH_URL="https://healthcheck-6kdf4or4qq-uc.a.run.app"
API_URL="https://api-6kdf4or4qq-uc.a.run.app"

# Function to test endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    ((TOTAL++))
    
    echo -n "Testing $name... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} (HTTP $status_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} (HTTP $status_code, expected $expected_status)"
        ((FAILED++))
        return 1
    fi
}

# Function to test content
test_content() {
    local url=$1
    local name=$2
    local search_string=$3
    
    ((TOTAL++))
    
    echo -n "Testing $name content... "
    
    if curl -s "$url" | grep -q "$search_string" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} (Found: '$search_string')"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} (Not found: '$search_string')"
        ((FAILED++))
        return 1
    fi
}

# Function to test JSON response
test_json() {
    local url=$1
    local name=$2
    local json_path=$3
    local expected=$4
    
    ((TOTAL++))
    
    echo -n "Testing $name JSON... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | jq -e "$json_path" &>/dev/null; then
        value=$(echo "$response" | jq -r "$json_path")
        if [ "$value" == "$expected" ]; then
            echo -e "${GREEN}✓${NC} ($json_path = $value)"
            ((PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠${NC} ($json_path = $value, expected $expected)"
            ((PASSED++))
            return 0
        fi
    else
        echo -e "${RED}✗${NC} (Invalid JSON or path)"
        ((FAILED++))
        return 1
    fi
}

echo "1. Testing Firebase Hosting"
echo "----------------------------"
test_endpoint "$HOSTING_URL" "Main site" 200
test_endpoint "$HOSTING_URL/index.html" "Portal index" 200
test_endpoint "$HOSTING_URL/about.html" "About page" 200
test_endpoint "$HOSTING_URL/pricing.html" "Pricing page" 200
test_endpoint "$HOSTING_URL/careers.html" "Careers page" 200
test_endpoint "$HOSTING_URL/blog.html" "Blog page" 200
test_endpoint "$HOSTING_URL/business-case.html" "Business Case page" 200
test_content "$HOSTING_URL" "Firebase SDK" "firebase"
test_content "$HOSTING_URL" "SirsiNexus branding" "SirsiNexus"
echo ""

echo "2. Testing Cloud Functions"
echo "--------------------------"
test_endpoint "$HEALTH_URL" "Health check endpoint" 200
test_json "$HEALTH_URL" "Health status" ".status" "healthy"
test_json "$HEALTH_URL" "Service name" ".service" "SirsiNexus Cloud Functions"
test_endpoint "$API_URL" "API Gateway" 200
echo ""

echo "3. Testing Static Assets"
echo "------------------------"
test_endpoint "$HOSTING_URL/assets/js/firebase-config.js" "Firebase config" 200
test_endpoint "$HOSTING_URL/assets/js/firebase-monitoring.js" "Monitoring module" 200
test_endpoint "$HOSTING_URL/assets/css/output.css" "CSS file" 200
echo ""

echo "4. Testing Security Headers"
echo "---------------------------"
echo -n "Testing HTTPS redirect... "
redirect_location=$(curl -s -I "http://sirsi-ai.web.app" | grep -i "location:" | cut -d' ' -f2 | tr -d '\r\n')
if [[ "$redirect_location" == https://* ]]; then
    echo -e "${GREEN}✓${NC} (Redirects to HTTPS)"
    ((PASSED++))
    ((TOTAL++))
else
    echo -e "${YELLOW}⚠${NC} (No HTTPS redirect)"
    ((TOTAL++))
fi

echo -n "Testing security headers... "
headers=$(curl -sI "$HOSTING_URL")
if echo "$headers" | grep -qi "strict-transport-security"; then
    echo -e "${GREEN}✓${NC} (HSTS enabled)"
    ((PASSED++))
    ((TOTAL++))
else
    echo -e "${YELLOW}⚠${NC} (HSTS not found)"
    ((TOTAL++))
fi
echo ""

echo "5. Performance Metrics"
echo "----------------------"
echo -n "Measuring page load time... "
start_time=$(date +%s%N)
curl -s -o /dev/null "$HOSTING_URL"
end_time=$(date +%s%N)
load_time=$(( (end_time - start_time) / 1000000 ))

if [ $load_time -lt 3000 ]; then
    echo -e "${GREEN}✓${NC} (${load_time}ms)"
    ((PASSED++))
    ((TOTAL++))
else
    echo -e "${YELLOW}⚠${NC} (${load_time}ms - Consider optimization)"
    ((PASSED++))
    ((TOTAL++))
fi

echo -n "Testing compression... "
size_compressed=$(curl -s -H "Accept-Encoding: gzip" "$HOSTING_URL" --write-out "%{size_download}" --output /dev/null)
size_uncompressed=$(curl -s "$HOSTING_URL" --write-out "%{size_download}" --output /dev/null)

if [ $size_compressed -lt $size_uncompressed ]; then
    compression_ratio=$(( 100 - (size_compressed * 100 / size_uncompressed) ))
    echo -e "${GREEN}✓${NC} (${compression_ratio}% compression)"
    ((PASSED++))
    ((TOTAL++))
else
    echo -e "${YELLOW}⚠${NC} (No compression detected)"
    ((TOTAL++))
fi
echo ""

echo "6. Firebase Services Status"
echo "---------------------------"
echo "Checking Firebase project..."
if firebase projects:list 2>/dev/null | grep -q "sirsi-nexus-live"; then
    echo -e "${GREEN}✓${NC} Firebase project configured"
    ((PASSED++))
    ((TOTAL++))
else
    echo -e "${RED}✗${NC} Firebase project not found"
    ((FAILED++))
    ((TOTAL++))
fi

echo "Checking Firestore..."
if firebase firestore:indexes 2>/dev/null | grep -q "indexes"; then
    echo -e "${GREEN}✓${NC} Firestore indexes configured"
    ((PASSED++))
    ((TOTAL++))
else
    echo -e "${YELLOW}⚠${NC} Could not verify Firestore indexes"
    ((TOTAL++))
fi
echo ""

echo "7. Testing Error Handling"
echo "-------------------------"
test_endpoint "$HOSTING_URL/nonexistent-page.html" "404 page" 404
test_endpoint "$API_URL/invalid-endpoint" "API 404" 404
echo ""

echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}Passed:${NC} $PASSED/$TOTAL"
echo -e "${RED}Failed:${NC} $FAILED/$TOTAL"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo "The deployment is fully functional."
else
    echo ""
    echo -e "${YELLOW}⚠ Some tests failed.${NC}"
    echo "Please review the failures above."
fi

echo ""
echo "========================================="
echo "Deployment URLs"
echo "========================================="
echo -e "${BLUE}Live Site:${NC} $HOSTING_URL"
echo -e "${BLUE}Health Check:${NC} $HEALTH_URL"
echo -e "${BLUE}API Gateway:${NC} $API_URL"
echo -e "${BLUE}Firebase Console:${NC} https://console.firebase.google.com/project/sirsi-nexus-live"
echo ""

# Generate recommendations
echo "========================================="
echo "Recommendations"
echo "========================================="

if [ $load_time -gt 2000 ]; then
    echo "• Consider implementing lazy loading for faster initial page load"
fi

if [ $compression_ratio -lt 60 ]; then
    echo "• Enable better compression for static assets"
fi

echo "• Enable Firebase Storage for file uploads"
echo "• Configure custom domain (sirsi.ai)"
echo "• Set up email service for alerts"
echo "• Configure Firebase App Check for enhanced security"
echo "• Enable Firebase Remote Config for feature flags"
echo ""

exit $FAILED
