#!/bin/bash

# SirsiNexus Test Runner
# Provides robust test execution with proper timeout and signal handling

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SIRSI_HOME="/Users/thekryptodragon/SirsiNexus"
DEFAULT_TIMEOUT=120
TEST_LOG_DIR="/tmp/sirsi-tests"

# Ensure test log directory exists
mkdir -p "$TEST_LOG_DIR"

# Logging functions
log_info() { echo -e "${BLUE}INFO: $1${NC}"; }
log_success() { echo -e "${GREEN}SUCCESS: $1${NC}"; }
log_warning() { echo -e "${YELLOW}WARNING: $1${NC}"; }
log_error() { echo -e "${RED}ERROR: $1${NC}"; }

# Signal handler for cleanup
cleanup() {
    if [[ -n "${TEST_PID:-}" ]]; then
        log_info "Cleaning up test process..."
        kill -KILL "$TEST_PID" 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# Function to run tests with robust timeout
run_tests_with_timeout() {
    local test_type="$1"
    local timeout_duration="${2:-$DEFAULT_TIMEOUT}"
    local test_log="$TEST_LOG_DIR/test-$(date +%Y%m%d-%H%M%S).log"
    
    log_info "Running $test_type tests with ${timeout_duration}s timeout..."
    log_info "Test output will be logged to: $test_log"
    
    # Change to project directory
    cd "$SIRSI_HOME"
    
    # Create test command based on type
    local test_cmd
    case "$test_type" in
        "unit")
            test_cmd="cargo test --lib --message-format=human -- --nocapture"
            ;;
        "integration")
            test_cmd="cargo test --tests --message-format=human -- --nocapture"
            ;;
        "all")
            test_cmd="cargo test --message-format=human -- --nocapture"
            ;;
        "specific")
            local test_name="$3"
            test_cmd="cargo test \"$test_name\" --message-format=human -- --nocapture"
            ;;
        *)
            log_error "Unknown test type: $test_type"
            return 1
            ;;
    esac
    
    # Use GNU timeout if available, otherwise use a fallback
    if command -v gtimeout >/dev/null 2>&1; then
        # GNU timeout (from coreutils)
        if gtimeout "${timeout_duration}s" bash -c "$test_cmd" > "$test_log" 2>&1; then
            log_success "$test_type tests completed successfully"
            rm -f "$test_log"
            return 0
        else
            local exit_code=$?
            if [[ $exit_code -eq 124 ]]; then
                log_error "Tests timed out after ${timeout_duration}s"
                # Kill any remaining processes
                pkill -f "cargo test" 2>/dev/null || true
                sleep 1
                pkill -9 -f "cargo test" 2>/dev/null || true
            else
                log_error "$test_type tests failed with exit code: $exit_code"
            fi
            show_test_output "$test_log"
            return $exit_code
        fi
    else
        # Fallback: use system timeout command
        if timeout "${timeout_duration}s" bash -c "$test_cmd" > "$test_log" 2>&1; then
            log_success "$test_type tests completed successfully"
            rm -f "$test_log"
            return 0
        else
            local exit_code=$?
            if [[ $exit_code -eq 124 ]]; then
                log_error "Tests timed out after ${timeout_duration}s"
                # Kill any remaining processes
                pkill -f "cargo test" 2>/dev/null || true
                sleep 1
                pkill -9 -f "cargo test" 2>/dev/null || true
            else
                log_error "$test_type tests failed with exit code: $exit_code"
            fi
            show_test_output "$test_log"
            return $exit_code
        fi
    fi
}

# Show test output for debugging
show_test_output() {
    local test_log="$1"
    
    if [[ -f "$test_log" ]]; then
        log_info "Last 30 lines of test output:"
        echo "================================"
        tail -30 "$test_log"
        echo "================================"
        log_info "Full test log available at: $test_log"
    fi
}

# Show running tests
show_running_tests() {
    log_info "Checking for running test processes..."
    
    local rust_tests=$(pgrep -f "cargo test" || true)
    if [[ -n "$rust_tests" ]]; then
        log_warning "Found running cargo test processes:"
        ps -p $rust_tests -o pid,ppid,cmd || true
    else
        log_success "No cargo test processes running"
    fi
}

# Kill all running tests
kill_all_tests() {
    log_info "Killing all running test processes..."
    
    # Kill cargo test processes
    pkill -f "cargo test" 2>/dev/null || true
    
    # Kill any test binaries
    pkill -f "sirsi.*test" 2>/dev/null || true
    
    # Wait a moment for processes to terminate
    sleep 2
    
    # Force kill if still running
    pkill -9 -f "cargo test" 2>/dev/null || true
    pkill -9 -f "sirsi.*test" 2>/dev/null || true
    
    log_success "All test processes terminated"
}

# Usage information
usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  unit [timeout]           - Run unit tests (default: ${DEFAULT_TIMEOUT}s timeout)"
    echo "  integration [timeout]    - Run integration tests"
    echo "  all [timeout]           - Run all tests"
    echo "  specific TEST [timeout] - Run specific test"
    echo "  status                  - Show running test processes"
    echo "  kill                    - Kill all running test processes"
    echo "  help                    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 unit 60              - Run unit tests with 60s timeout"
    echo "  $0 specific test_name   - Run specific test"
    echo "  $0 kill                 - Kill all running tests"
    echo ""
    echo "Environment variables:"
    echo "  SIRSI_HOME              - SirsiNexus project directory (default: $SIRSI_HOME)"
    echo "  DEFAULT_TIMEOUT         - Default timeout in seconds (default: $DEFAULT_TIMEOUT)"
}

# Main command processing
main() {
    local command="${1:-help}"
    
    case "$command" in
        "unit")
            run_tests_with_timeout "unit" "${2:-$DEFAULT_TIMEOUT}"
            ;;
        "integration")
            run_tests_with_timeout "integration" "${2:-$DEFAULT_TIMEOUT}"
            ;;
        "all")
            run_tests_with_timeout "all" "${2:-$DEFAULT_TIMEOUT}"
            ;;
        "specific")
            if [[ -z "${2:-}" ]]; then
                log_error "Test name required for specific test"
                usage
                exit 1
            fi
            run_tests_with_timeout "specific" "${3:-$DEFAULT_TIMEOUT}" "$2"
            ;;
        "status")
            show_running_tests
            ;;
        "kill")
            kill_all_tests
            ;;
        "help"|"-h"|"--help")
            usage
            ;;
        *)
            log_error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
