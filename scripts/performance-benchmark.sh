#!/bin/bash

# SirsiNexus Performance Benchmark Suite
# Phase 5.5 Performance Optimization

echo "⚡ Running SirsiNexus Performance Benchmarks..."

# PostgreSQL Performance Tests
echo "🗄️ Testing PostgreSQL Performance..."
BENCH_DATE=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="performance-results-${BENCH_DATE}"
mkdir -p "${RESULTS_DIR}"

# Database connection test
echo "Testing database connection latency..." | tee "${RESULTS_DIR}/db-latency.txt"
for i in {1..10}; do
  start=$(date +%s%3N)
  postgres sql --insecure --host=localhost:26257 --database=sirsi_nexus --execute="SELECT 1;" >/dev/null 2>&1
  end=$(date +%s%3N)
  latency=$((end - start))
  echo "Connection $i: ${latency}ms" | tee -a "${RESULTS_DIR}/db-latency.txt"
done

# API Response Time Tests
echo "🌐 Testing API Response Times..."
apis=("localhost:8080/health" "localhost:3000/api/health")

for api in "${apis[@]}"; do
  echo "Testing $api..." | tee -a "${RESULTS_DIR}/api-performance.txt"
  for i in {1..10}; do
    response_time=$(curl -o /dev/null -s -w "%{time_total}\n" "http://$api")
    echo "  Request $i: ${response_time}s" | tee -a "${RESULTS_DIR}/api-performance.txt"
  done
done

echo "✅ Performance benchmark complete! Results in ${RESULTS_DIR}/"
