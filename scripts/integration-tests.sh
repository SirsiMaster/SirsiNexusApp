#!/bin/bash

# SirsiNexus End-to-End Integration Testing
# Phase 5.5 Integration Testing

echo "🔬 Running SirsiNexus Integration Tests..."

TEST_DATE=$(date +"%Y%m%d_%H%M%S")
TEST_RESULTS="integration-test-results-${TEST_DATE}"
mkdir -p "${TEST_RESULTS}"

# Test 1: Frontend-Backend Integration
echo "🌐 Testing Frontend-Backend Integration..."
echo "=== Frontend-Backend Integration Test ===" > "${TEST_RESULTS}/integration.log"

# Start frontend dev server in background if not running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "Starting frontend dev server..." | tee -a "${TEST_RESULTS}/integration.log"
  cd ui && npm run dev > "../${TEST_RESULTS}/frontend.log" 2>&1 &
  FRONTEND_PID=$!
  sleep 10
  cd ..
else
  echo "Frontend already running" | tee -a "${TEST_RESULTS}/integration.log"
fi

# Test API endpoints
endpoints=(
  "http://localhost:8080/health"
  "http://localhost:3000/api/health"
  "http://localhost:8080/api/settings"
  "http://localhost:8080/api/auth/health"
)

for endpoint in "${endpoints[@]}"; do
  echo "Testing $endpoint..." | tee -a "${TEST_RESULTS}/integration.log"
  if response=$(curl -s "$endpoint"); then
    echo "✅ $endpoint: OK" | tee -a "${TEST_RESULTS}/integration.log"
    echo "Response: $response" >> "${TEST_RESULTS}/integration.log"
  else
    echo "❌ $endpoint: FAILED" | tee -a "${TEST_RESULTS}/integration.log"
  fi
done

# Test 2: Database Integration
echo "🗄️ Testing Database Integration..."
if cockroach sql --insecure --host=localhost:26257 --database=sirsi_nexus --execute="SHOW TABLES;" > "${TEST_RESULTS}/db-tables.txt" 2>&1; then
  echo "✅ Database connection successful" | tee -a "${TEST_RESULTS}/integration.log"
  table_count=$(grep -c "table_name" "${TEST_RESULTS}/db-tables.txt" || echo "0")
  echo "Found $table_count tables" | tee -a "${TEST_RESULTS}/integration.log"
else
  echo "❌ Database connection failed" | tee -a "${TEST_RESULTS}/integration.log"
fi

# Test 3: AI Services Integration
echo "🤖 Testing AI Services Integration..."
if curl -s "http://localhost:8080/ai/health" > "${TEST_RESULTS}/ai-health.json"; then
  echo "✅ AI services health check passed" | tee -a "${TEST_RESULTS}/integration.log"
else
  echo "❌ AI services health check failed" | tee -a "${TEST_RESULTS}/integration.log"
fi

# Cleanup
if [ ! -z "$FRONTEND_PID" ]; then
  kill $FRONTEND_PID 2>/dev/null
fi

echo "✅ Integration tests complete! Results in ${TEST_RESULTS}/"
