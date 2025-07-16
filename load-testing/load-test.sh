#!/bin/bash

# SirsiNexus Load Testing Suite
# Phase 3 High-Scale Production Environment Simulation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Load test configuration
TEST_DATE=$(date +"%Y%m%d_%H%M%S")
TEST_DIR="load-test-${TEST_DATE}"
LOG_FILE="${TEST_DIR}/load-test.log"

# Test parameters
BASE_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:3000"
MAX_USERS=${MAX_USERS:-100}
DURATION=${DURATION:-300}  # 5 minutes default
RAMP_TIME=${RAMP_TIME:-60}  # 1 minute ramp-up

# Performance thresholds (from CDB requirements)
MAX_RESPONSE_TIME=200  # milliseconds
MIN_THROUGHPUT=1000    # operations per second
MIN_SUCCESS_RATE=99.5  # percentage

# Create test directory
mkdir -p "${TEST_DIR}"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "${LOG_FILE}"
}

log_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}" | tee -a "${LOG_FILE}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking Prerequisites..."
    
    local missing_tools=()
    
    # Check for required tools
    if ! command_exists curl; then
        missing_tools+=("curl")
    fi
    
    if ! command_exists jq; then
        missing_tools+=("jq")
    fi
    
    # Check for load testing tools (at least one required)
    local load_tools=0
    if command_exists ab; then
        log_success "Apache Bench (ab) available"
        load_tools=$((load_tools + 1))
    fi
    
    if command_exists wrk; then
        log_success "wrk available"
        load_tools=$((load_tools + 1))
    fi
    
    if command_exists hey; then
        log_success "hey available"
        load_tools=$((load_tools + 1))
    fi
    
    if command_exists k6; then
        log_success "k6 available"
        load_tools=$((load_tools + 1))
    fi
    
    if [ "$load_tools" -eq 0 ]; then
        log_error "No load testing tools found. Please install one of: ab, wrk, hey, k6"
        exit 1
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Install with: brew install ${missing_tools[*]} (macOS) or apt-get install ${missing_tools[*]} (Ubuntu)"
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

# Check service availability
check_services() {
    log "🌐 Checking Service Availability..."
    
    local services=(
        "${BASE_URL}/health:Core Engine"
        "${FRONTEND_URL}/api/health:Frontend"
        "http://localhost:26257/health:CockroachDB"
    )
    
    for service in "${services[@]}"; do
        local url=$(echo "$service" | cut -d: -f1)
        local name=$(echo "$service" | cut -d: -f2)
        
        if curl -f -s "$url" >/dev/null 2>&1; then
            log_success "$name is accessible"
        else
            log_error "$name is not accessible at $url"
            log_info "Make sure all services are running before load testing"
            exit 1
        fi
    done
}

# Generate test data
generate_test_data() {
    log "📊 Generating Test Data..."
    
    # Create test user credentials
    cat > "${TEST_DIR}/test-user.json" << EOF
{
    "email": "loadtest@sirsinexus.com",
    "password": "LoadTest123!",
    "name": "Load Test User"
}
EOF
    
    # Create test project data
    cat > "${TEST_DIR}/test-project.json" << EOF
{
    "name": "Load Test Project",
    "description": "Automated load testing project"
}
EOF
    
    # Generate JWT token for authenticated requests
    log "Generating authentication token..."
    local auth_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d @"${TEST_DIR}/test-user.json" \
        "${BASE_URL}/api/auth/register" 2>/dev/null || echo '{"error": "registration failed"}')
    
    if echo "$auth_response" | jq -e '.token' >/dev/null 2>&1; then
        local token=$(echo "$auth_response" | jq -r '.token')
        echo "Authorization: Bearer $token" > "${TEST_DIR}/auth-header.txt"
        log_success "Authentication token generated"
    else
        # Try login instead
        local login_response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d @"${TEST_DIR}/test-user.json" \
            "${BASE_URL}/api/auth/login" 2>/dev/null || echo '{"error": "login failed"}')
        
        if echo "$login_response" | jq -e '.token' >/dev/null 2>&1; then
            local token=$(echo "$login_response" | jq -r '.token')
            echo "Authorization: Bearer $token" > "${TEST_DIR}/auth-header.txt"
            log_success "Authentication token retrieved"
        else
            log_warning "Could not generate auth token, will test unauthenticated endpoints"
            echo "" > "${TEST_DIR}/auth-header.txt"
        fi
    fi
}

# Baseline performance test
run_baseline_test() {
    log "📏 Running Baseline Performance Test..."
    
    # Test health endpoint response time
    log "Testing health endpoint..."
    local health_times=()
    for i in {1..10}; do
        local start_time=$(date +%s%3N)
        curl -f -s "${BASE_URL}/health" >/dev/null
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        health_times+=("$response_time")
    done
    
    # Calculate average response time
    local total=0
    for time in "${health_times[@]}"; do
        total=$((total + time))
    done
    local avg_response=$((total / ${#health_times[@]}))
    
    echo "baseline_health_response_time: ${avg_response}ms" >> "${TEST_DIR}/metrics.txt"
    
    if [ "$avg_response" -le "$MAX_RESPONSE_TIME" ]; then
        log_success "Baseline response time: ${avg_response}ms (target: <${MAX_RESPONSE_TIME}ms)"
    else
        log_warning "Baseline response time: ${avg_response}ms exceeds target of ${MAX_RESPONSE_TIME}ms"
    fi
}

# Apache Bench load test
run_ab_test() {
    if ! command_exists ab; then
        return 0
    fi
    
    log "🚀 Running Apache Bench Load Test..."
    
    # Test different endpoints
    local endpoints=(
        "${BASE_URL}/health:health"
        "${BASE_URL}/api/projects:projects"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url=$(echo "$endpoint" | cut -d: -f1)
        local name=$(echo "$endpoint" | cut -d: -f2)
        
        log "Testing $name endpoint with ab..."
        
        # Run ab test: 1000 requests, 10 concurrent
        ab -n 1000 -c 10 -g "${TEST_DIR}/ab-${name}.tsv" "$url" > "${TEST_DIR}/ab-${name}.txt" 2>&1
        
        # Extract metrics
        local avg_response=$(grep "Time per request" "${TEST_DIR}/ab-${name}.txt" | head -1 | awk '{print $4}')
        local requests_per_sec=$(grep "Requests per second" "${TEST_DIR}/ab-${name}.txt" | awk '{print $4}')
        local failed_requests=$(grep "Failed requests" "${TEST_DIR}/ab-${name}.txt" | awk '{print $3}')
        
        echo "ab_${name}_avg_response: ${avg_response}ms" >> "${TEST_DIR}/metrics.txt"
        echo "ab_${name}_requests_per_sec: $requests_per_sec" >> "${TEST_DIR}/metrics.txt"
        echo "ab_${name}_failed_requests: $failed_requests" >> "${TEST_DIR}/metrics.txt"
        
        log_info "AB Test $name - Avg: ${avg_response}ms, RPS: $requests_per_sec, Failed: $failed_requests"
    done
}

# wrk load test
run_wrk_test() {
    if ! command_exists wrk; then
        return 0
    fi
    
    log "🚀 Running wrk Load Test..."
    
    # Create wrk script for complex scenarios
    cat > "${TEST_DIR}/wrk-script.lua" << 'EOF'
-- wrk script for SirsiNexus load testing

local counter = 1
local threads = {}

function setup(thread)
   thread:set("id", counter)
   table.insert(threads, thread)
   counter = counter + 1
end

function init(args)
   requests = 0
   responses = 0
   
   local msg = "thread %d created"
   print(msg:format(id))
end

function request()
   requests = requests + 1
   return wrk.request()
end

function response(status, headers, body)
   responses = responses + 1
end

function done(summary, latency, requests)
   io.write("------------------------------\n")
   for index, thread in ipairs(threads) do
      local id = thread:get("id")
      local requests = thread:get("requests")
      local responses = thread:get("responses")
      local msg = "thread %d made %d requests and got %d responses"
      io.write(msg:format(id, requests, responses))
   end
end
EOF
    
    # Run wrk test
    log "Running wrk test: ${MAX_USERS} connections, ${DURATION}s duration..."
    wrk -t 10 -c "$MAX_USERS" -d "${DURATION}s" -s "${TEST_DIR}/wrk-script.lua" \
        --latency "${BASE_URL}/health" > "${TEST_DIR}/wrk-results.txt" 2>&1
    
    # Extract metrics
    local avg_latency=$(grep "Latency" "${TEST_DIR}/wrk-results.txt" | awk '{print $2}')
    local req_per_sec=$(grep "Req/Sec" "${TEST_DIR}/wrk-results.txt" | awk '{print $2}')
    local total_requests=$(grep "requests in" "${TEST_DIR}/wrk-results.txt" | awk '{print $1}')
    
    echo "wrk_avg_latency: $avg_latency" >> "${TEST_DIR}/metrics.txt"
    echo "wrk_req_per_sec: $req_per_sec" >> "${TEST_DIR}/metrics.txt"
    echo "wrk_total_requests: $total_requests" >> "${TEST_DIR}/metrics.txt"
    
    log_info "wrk Test - Latency: $avg_latency, RPS: $req_per_sec, Total: $total_requests"
}

# k6 load test
run_k6_test() {
    if ! command_exists k6; then
        return 0
    fi
    
    log "🚀 Running k6 Load Test..."
    
    # Create k6 test script
    cat > "${TEST_DIR}/k6-test.js" << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '${RAMP_TIME}s', target: ${MAX_USERS} },
    { duration: '${DURATION}s', target: ${MAX_USERS} },
    { duration: '${RAMP_TIME}s', target: 0 },
  ],
};

const BASE_URL = '${BASE_URL}';

export default function() {
  // Test health endpoint
  let healthResponse = http.get(\`\${BASE_URL}/health\`);
  check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response time < ${MAX_RESPONSE_TIME}ms': (r) => r.timings.duration < ${MAX_RESPONSE_TIME},
  }) || errorRate.add(1);

  // Test projects endpoint
  let projectsResponse = http.get(\`\${BASE_URL}/api/projects\`);
  check(projectsResponse, {
    'projects status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'projects response time < ${MAX_RESPONSE_TIME}ms': (r) => r.timings.duration < ${MAX_RESPONSE_TIME},
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  return {
    '${TEST_DIR}/k6-summary.json': JSON.stringify(data),
  };
}
EOF
    
    # Run k6 test
    k6 run "${TEST_DIR}/k6-test.js" > "${TEST_DIR}/k6-results.txt" 2>&1
    
    # Extract metrics from JSON summary if available
    if [ -f "${TEST_DIR}/k6-summary.json" ]; then
        local avg_duration=$(jq -r '.metrics.http_req_duration.values.avg' "${TEST_DIR}/k6-summary.json" 2>/dev/null || echo "0")
        local req_rate=$(jq -r '.metrics.http_reqs.values.rate' "${TEST_DIR}/k6-summary.json" 2>/dev/null || echo "0")
        local error_rate=$(jq -r '.metrics.errors.values.rate' "${TEST_DIR}/k6-summary.json" 2>/dev/null || echo "0")
        
        echo "k6_avg_duration: ${avg_duration}ms" >> "${TEST_DIR}/metrics.txt"
        echo "k6_req_rate: $req_rate" >> "${TEST_DIR}/metrics.txt"
        echo "k6_error_rate: $error_rate" >> "${TEST_DIR}/metrics.txt"
        
        log_info "k6 Test - Avg Duration: ${avg_duration}ms, Rate: $req_rate/s, Errors: $error_rate"
    fi
}

# Database load test
run_database_test() {
    log "🗄️ Running Database Load Test..."
    
    # Test database connection pool under load
    log "Testing database connection pool..."
    
    local start_time=$(date +%s)
    local concurrent_connections=20
    local queries_per_connection=50
    
    for i in $(seq 1 $concurrent_connections); do
        (
            for j in $(seq 1 $queries_per_connection); do
                cockroach sql --insecure --host=localhost:26257 --database=sirsi_nexus \
                    --execute="SELECT version();" >/dev/null 2>&1
            done
        ) &
    done
    
    wait  # Wait for all background processes
    local end_time=$(date +%s)
    local total_time=$((end_time - start_time))
    local total_queries=$((concurrent_connections * queries_per_connection))
    local queries_per_sec=$((total_queries / total_time))
    
    echo "db_queries_per_sec: $queries_per_sec" >> "${TEST_DIR}/metrics.txt"
    echo "db_total_time: ${total_time}s" >> "${TEST_DIR}/metrics.txt"
    
    log_info "Database Test - $queries_per_sec queries/sec over ${total_time}s"
}

# Memory and CPU monitoring
monitor_resources() {
    log "📊 Monitoring System Resources..."
    
    # Start resource monitoring in background
    (
        while true; do
            local timestamp=$(date +%s)
            local cpu_usage=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "0")
            local memory_usage=$(top -l 1 -n 0 | grep "PhysMem" | awk '{print $2}' | sed 's/M//' 2>/dev/null || echo "0")
            
            echo "$timestamp,$cpu_usage,$memory_usage" >> "${TEST_DIR}/resource-monitor.csv"
            sleep 5
        done
    ) &
    
    local monitor_pid=$!
    echo $monitor_pid > "${TEST_DIR}/monitor.pid"
    
    log_info "Resource monitoring started (PID: $monitor_pid)"
}

# Stop resource monitoring
stop_monitoring() {
    if [ -f "${TEST_DIR}/monitor.pid" ]; then
        local monitor_pid=$(cat "${TEST_DIR}/monitor.pid")
        kill $monitor_pid 2>/dev/null || true
        rm "${TEST_DIR}/monitor.pid"
        log_info "Resource monitoring stopped"
    fi
}

# Analyze results
analyze_results() {
    log "📈 Analyzing Load Test Results..."
    
    local report_file="${TEST_DIR}/load-test-report.md"
    
    cat > "$report_file" << EOF
# SirsiNexus Load Test Report

**Date**: $(date)
**Test ID**: ${TEST_DATE}
**Configuration**: ${MAX_USERS} users, ${DURATION}s duration

## Test Environment
- Base URL: ${BASE_URL}
- Frontend URL: ${FRONTEND_URL}
- Max Users: ${MAX_USERS}
- Test Duration: ${DURATION}s
- Ramp Time: ${RAMP_TIME}s

## Performance Targets
- Max Response Time: ${MAX_RESPONSE_TIME}ms
- Min Throughput: ${MIN_THROUGHPUT} ops/sec
- Min Success Rate: ${MIN_SUCCESS_RATE}%

## Results Summary

EOF
    
    # Analyze metrics
    local overall_score=100
    local failed_tests=()
    
    if [ -f "${TEST_DIR}/metrics.txt" ]; then
        # Check baseline response time
        local baseline_response=$(grep "baseline_health_response_time" "${TEST_DIR}/metrics.txt" | cut -d: -f2 | sed 's/ms//' | tr -d ' ')
        if [ -n "$baseline_response" ]; then
            echo "- **Baseline Response Time**: ${baseline_response}ms" >> "$report_file"
            if [ "$baseline_response" -gt "$MAX_RESPONSE_TIME" ]; then
                failed_tests+=("Baseline response time")
                overall_score=$((overall_score - 20))
            fi
        fi
        
        # Check throughput from various tools
        local max_throughput=0
        for metric in $(grep "_req.*_per_sec\|_requests_per_sec" "${TEST_DIR}/metrics.txt"); do
            local value=$(echo "$metric" | cut -d: -f2 | tr -d ' ' | sed 's/[^0-9.]//g')
            if [ -n "$value" ] && (( $(echo "$value > $max_throughput" | bc -l) )); then
                max_throughput=$value
            fi
        done
        
        if [ -n "$max_throughput" ] && [ "$max_throughput" != "0" ]; then
            echo "- **Peak Throughput**: ${max_throughput} ops/sec" >> "$report_file"
            if (( $(echo "$max_throughput < $MIN_THROUGHPUT" | bc -l) )); then
                failed_tests+=("Throughput target")
                overall_score=$((overall_score - 25))
            fi
        fi
        
        # Add all metrics to report
        echo -e "\n## Detailed Metrics\n" >> "$report_file"
        while IFS=: read -r metric value; do
            echo "- **${metric//_/ }**: $value" >> "$report_file"
        done < "${TEST_DIR}/metrics.txt"
    fi
    
    # Performance assessment
    echo -e "\n## Performance Assessment\n" >> "$report_file"
    
    if [ ${#failed_tests[@]} -eq 0 ]; then
        echo "🟢 **PASSED**: All performance targets met" >> "$report_file"
        log_success "Load test PASSED - All targets met"
    else
        echo "🔴 **FAILED**: Performance targets not met" >> "$report_file"
        echo -e "\nFailed tests:" >> "$report_file"
        for test in "${failed_tests[@]}"; do
            echo "- $test" >> "$report_file"
        done
        log_error "Load test FAILED - Targets not met: ${failed_tests[*]}"
    fi
    
    echo -e "\n**Overall Score**: $overall_score/100" >> "$report_file"
    
    # Add recommendations
    cat >> "$report_file" << EOF

## Recommendations

### Performance Optimization
1. Monitor response times under load
2. Optimize database queries and connection pooling
3. Consider horizontal scaling for high load scenarios
4. Implement caching strategies for frequently accessed data

### Monitoring
1. Set up continuous performance monitoring
2. Implement alerting for performance degradation
3. Regular load testing in staging environment
4. Monitor resource utilization trends

## Files Generated
- Test metrics: metrics.txt
- Resource monitoring: resource-monitor.csv
- Tool-specific reports: *-results.txt
- Raw data: *.tsv, *.json

EOF
    
    log_success "Load test report generated: $report_file"
    
    # Display summary
    echo ""
    echo "=================================="
    echo "  LOAD TEST SUMMARY"
    echo "=================================="
    echo "Overall Score: $overall_score/100"
    
    if [ ${#failed_tests[@]} -eq 0 ]; then
        echo "Status: ✅ PERFORMANCE TARGETS MET"
    else
        echo "Status: ❌ PERFORMANCE IMPROVEMENTS NEEDED"
        echo "Failed: ${failed_tests[*]}"
    fi
    
    echo "Report: $report_file"
    echo "=================================="
}

# Main execution
main() {
    log "🚀 Starting SirsiNexus Load Testing..."
    log "Test Directory: ${TEST_DIR}"
    log "Configuration: ${MAX_USERS} users, ${DURATION}s duration, ${RAMP_TIME}s ramp-up"
    
    # Initialize
    echo "timestamp,cpu_usage,memory_usage" > "${TEST_DIR}/resource-monitor.csv"
    echo "# Load Test Metrics" > "${TEST_DIR}/metrics.txt"
    
    # Run tests
    check_prerequisites
    check_services
    generate_test_data
    
    # Start monitoring
    monitor_resources
    
    # Run load tests
    run_baseline_test
    run_ab_test
    run_wrk_test
    run_k6_test
    run_database_test
    
    # Stop monitoring
    stop_monitoring
    
    # Analyze and report
    analyze_results
    
    log "🎉 Load testing completed!"
    log "📁 Results available in: ${TEST_DIR}/"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --users)
            MAX_USERS="$2"
            shift 2
            ;;
        --duration)
            DURATION="$2"
            shift 2
            ;;
        --ramp-time)
            RAMP_TIME="$2"
            shift 2
            ;;
        --base-url)
            BASE_URL="$2"
            shift 2
            ;;
        --frontend-url)
            FRONTEND_URL="$2"
            shift 2
            ;;
        -h|--help)
            echo "SirsiNexus Load Testing Suite"
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --users NUM          Maximum concurrent users (default: 100)"
            echo "  --duration SEC       Test duration in seconds (default: 300)"
            echo "  --ramp-time SEC      Ramp-up time in seconds (default: 60)"
            echo "  --base-url URL       Base API URL (default: http://localhost:8080)"
            echo "  --frontend-url URL   Frontend URL (default: http://localhost:3000)"
            echo "  -h, --help           Show this help message"
            echo ""
            echo "Example:"
            echo "  $0 --users 200 --duration 600 --ramp-time 120"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Execute main function
main "$@"
