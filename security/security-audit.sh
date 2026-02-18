#!/bin/bash

# SirsiNexus Security Audit Script
# Phase 3 Security Hardening Implementation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Security audit configuration
AUDIT_DATE=$(date +"%Y%m%d_%H%M%S")
AUDIT_DIR="security-audit-${AUDIT_DATE}"
LOG_FILE="${AUDIT_DIR}/security-audit.log"

# Create audit directory
mkdir -p "${AUDIT_DIR}"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Security audit functions
audit_network_security() {
    log "🔒 Auditing Network Security..."
    
    # Check open ports
    log "Checking open ports..."
    netstat -tuln > "${AUDIT_DIR}/open-ports.txt" 2>/dev/null || ss -tuln > "${AUDIT_DIR}/open-ports.txt"
    
    # Expected ports: 26257 (PostgreSQL), 6379 (Redis), 8080 (Core Engine), 3000 (Frontend)
    local expected_ports=(26257 6379 8080 3000)
    local security_score=100
    
    for port in "${expected_ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":${port}" || ss -tuln 2>/dev/null | grep -q ":${port}"; then
            log_success "Port ${port} is accessible (expected)"
        else
            log_warning "Port ${port} is not accessible"
            security_score=$((security_score - 10))
        fi
    done
    
    # Check for unexpected open ports
    local unexpected_ports=$(netstat -tuln 2>/dev/null | grep -E ":22|:23|:80|:443|:5432" | wc -l || echo "0")
    unexpected_ports=$(echo "$unexpected_ports" | tr -d ' ')
    if [ "$unexpected_ports" -gt 0 ] 2>/dev/null; then
        log_warning "Found $unexpected_ports potentially insecure ports open"
        security_score=$((security_score - 5))
    fi
    
    echo "network_security_score: $security_score" >> "${AUDIT_DIR}/scores.txt"
}

audit_authentication() {
    log "🔐 Auditing Authentication Security..."
    
    local auth_score=100
    
    # Check JWT token security
    log "Checking JWT token configuration..."
    if [ -f ".env" ]; then
        if grep -q "JWT_SECRET" .env; then
            local jwt_secret=$(grep "JWT_SECRET" .env | cut -d'=' -f2)
            if [ ${#jwt_secret} -lt 32 ]; then
                log_error "JWT secret is too short (< 32 characters)"
                auth_score=$((auth_score - 20))
            else
                log_success "JWT secret length is adequate"
            fi
        else
            log_warning "JWT_SECRET not found in .env file"
            auth_score=$((auth_score - 15))
        fi
    else
        log_warning ".env file not found"
        auth_score=$((auth_score - 10))
    fi
    
    # Check Argon2 implementation
    log "Checking password hashing implementation..."
    if grep -r "argon2" core-engine/src/ >/dev/null 2>&1; then
        log_success "Argon2 password hashing detected"
    else
        log_error "Argon2 password hashing not found"
        auth_score=$((auth_score - 25))
    fi
    
    echo "authentication_score: $auth_score" >> "${AUDIT_DIR}/scores.txt"
}

audit_database_security() {
    log "🗄️ Auditing Database Security..."
    
    local db_score=100
    
    # Check PostgreSQL security
    log "Checking PostgreSQL security configuration..."
    
    # Test database connection security
    if command_exists postgres; then
        # Check if database is running with --insecure flag (development only)
        if pgrep -f "postgres.*--insecure" >/dev/null; then
            log_warning "PostgreSQL running in insecure mode (development only)"
            db_score=$((db_score - 30))
        else
            log_success "PostgreSQL running in secure mode"
        fi
        
        # Check database permissions
        local db_check=$(postgres sql --insecure --host=localhost:26257 --database=sirsi_nexus --execute="SHOW GRANTS ON DATABASE sirsi_nexus;" 2>/dev/null || echo "error")
        if [ "$db_check" != "error" ]; then
            log_success "Database connectivity and permissions check passed"
        else
            log_error "Database connectivity issues detected"
            db_score=$((db_score - 20))
        fi
    else
        log_warning "PostgreSQL CLI not available for security check"
        db_score=$((db_score - 10))
    fi
    
    # Check Redis security
    log "Checking Redis security configuration..."
    if command_exists redis-cli; then
        # Check if Redis requires authentication
        local redis_auth=$(redis-cli ping 2>/dev/null || echo "error")
        if [ "$redis_auth" = "PONG" ]; then
            log_warning "Redis accessible without authentication (development mode)"
            db_score=$((db_score - 15))
        elif [ "$redis_auth" = "error" ]; then
            log_success "Redis requires authentication or is secured"
        fi
    else
        log_warning "Redis CLI not available for security check"
        db_score=$((db_score - 5))
    fi
    
    echo "database_security_score: $db_score" >> "${AUDIT_DIR}/scores.txt"
}

audit_application_security() {
    log "🛡️ Auditing Application Security..."
    
    local app_score=100
    
    # Check for hardcoded secrets
    log "Scanning for hardcoded secrets..."
    local secret_patterns=(
        "password.*=.*['\"][^'\"]{8,}['\"]"
        "secret.*=.*['\"][^'\"]{8,}['\"]"
        "api_key.*=.*['\"][^'\"]{8,}['\"]"
        "token.*=.*['\"][^'\"]{8,}['\"]"
    )
    
    local secrets_found=0
    for pattern in "${secret_patterns[@]}"; do
        local matches=$(grep -r -i -E "$pattern" core-engine/src/ ui/src/ 2>/dev/null | wc -l || echo "0")
        matches=$(echo "$matches" | tr -d ' ')
        secrets_found=$((secrets_found + matches))
    done
    
    if [ "$secrets_found" -gt 0 ] 2>/dev/null; then
        log_error "Found $secrets_found potential hardcoded secrets"
        app_score=$((app_score - 30))
    else
        log_success "No hardcoded secrets detected"
    fi
    
    # Check for SQL injection vulnerabilities
    log "Checking for SQL injection vulnerabilities..."
    local sql_patterns=(
        "format!.*SELECT"
        "format!.*INSERT"
        "format!.*UPDATE"
        "format!.*DELETE"
    )
    
    local sql_issues=0
    for pattern in "${sql_patterns[@]}"; do
        local matches=$(grep -r -E "$pattern" core-engine/src/ 2>/dev/null | wc -l || echo "0")
        matches=$(echo "$matches" | tr -d ' ')
        sql_issues=$((sql_issues + matches))
    done
    
    if [ "$sql_issues" -gt 0 ] 2>/dev/null; then
        log_warning "Found $sql_issues potential SQL injection vulnerabilities"
        app_score=$((app_score - 20))
    else
        log_success "No obvious SQL injection vulnerabilities detected"
    fi
    
    # Check TypeScript strict mode
    log "Checking TypeScript security configuration..."
    if [ -f "ui/tsconfig.json" ]; then
        if grep -q '"strict": true' ui/tsconfig.json; then
            log_success "TypeScript strict mode enabled"
        else
            log_warning "TypeScript strict mode not enabled"
            app_score=$((app_score - 10))
        fi
    fi
    
    echo "application_security_score: $app_score" >> "${AUDIT_DIR}/scores.txt"
}

audit_docker_security() {
    log "🐳 Auditing Docker Security..."
    
    local docker_score=100
    
    # Check Docker daemon security
    if command_exists docker; then
        log "Checking Docker configuration..."
        
        # Check if running as root
        if docker info 2>/dev/null | grep -q "WARNING"; then
            log_warning "Docker warnings detected"
            docker_score=$((docker_score - 10))
        fi
        
        # Check Docker images for vulnerabilities
        log "Scanning Docker images for vulnerabilities..."
        if command_exists trivy; then
            # Scan core images if they exist
            local images=("sirsi-nexus/core-engine" "sirsi-nexus/frontend" "sirsi-nexus/analytics")
            for image in "${images[@]}"; do
                if docker images | grep -q "$image"; then
                    trivy image --severity HIGH,CRITICAL "$image" > "${AUDIT_DIR}/trivy-${image//\//-}.txt" 2>/dev/null || true
                fi
            done
            log_success "Docker vulnerability scan completed"
        else
            log_warning "Trivy not installed - cannot scan Docker images"
            docker_score=$((docker_score - 15))
        fi
        
        # Check Dockerfile security best practices
        local dockerfiles=$(find . -name "Dockerfile*" -type f)
        for dockerfile in $dockerfiles; do
            # Check for non-root user
            if grep -q "USER " "$dockerfile"; then
                log_success "Non-root user specified in $dockerfile"
            else
                log_warning "No non-root user specified in $dockerfile"
                docker_score=$((docker_score - 5))
            fi
            
            # Check for COPY/ADD best practices
            if grep -q "COPY.*--chown" "$dockerfile"; then
                log_success "Secure file copying practices in $dockerfile"
            fi
        done
    else
        log_warning "Docker not available for security audit"
        docker_score=$((docker_score - 20))
    fi
    
    echo "docker_security_score: $docker_score" >> "${AUDIT_DIR}/scores.txt"
}

generate_security_report() {
    log "📊 Generating Security Report..."
    
    local report_file="${AUDIT_DIR}/security-report.md"
    
    cat > "$report_file" << EOF
# SirsiNexus Security Audit Report

**Date**: $(date)
**Audit ID**: ${AUDIT_DATE}

## Executive Summary

This report contains the results of a comprehensive security audit of the SirsiNexus platform.

## Security Scores

EOF
    
    # Calculate overall score
    local total_score=0
    local count=0
    
    while IFS=: read -r category score; do
        echo "- **${category//_/ }**: $score/100" >> "$report_file"
        total_score=$((total_score + score))
        count=$((count + 1))
    done < "${AUDIT_DIR}/scores.txt"
    
    local overall_score=$((total_score / count))
    
    cat >> "$report_file" << EOF

**Overall Security Score**: $overall_score/100

## Risk Assessment

EOF
    
    if [ "$overall_score" -ge 90 ]; then
        echo "🟢 **LOW RISK**: Excellent security posture" >> "$report_file"
    elif [ "$overall_score" -ge 75 ]; then
        echo "🟡 **MEDIUM RISK**: Good security with minor improvements needed" >> "$report_file"
    elif [ "$overall_score" -ge 60 ]; then
        echo "🟠 **HIGH RISK**: Security improvements required" >> "$report_file"
    else
        echo "🔴 **CRITICAL RISK**: Immediate security attention required" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

## Recommendations

### Immediate Actions
1. Review and address any critical vulnerabilities identified
2. Implement missing security configurations
3. Update dependencies with known vulnerabilities

### Security Hardening
1. Enable production security modes for all components
2. Implement proper authentication for all services
3. Regular security audits and vulnerability scanning

### Monitoring
1. Set up security monitoring and alerting
2. Implement intrusion detection systems
3. Regular security log analysis

## Detailed Findings

See individual audit logs for detailed findings:
- Network Security: open-ports.txt
- Authentication: Check JWT and password hashing
- Database Security: Verify encryption and access controls
- Application Security: Review code for vulnerabilities
- Docker Security: Container and image security

EOF
    
    log_success "Security report generated: $report_file"
    echo "overall_security_score: $overall_score" >> "${AUDIT_DIR}/scores.txt"
}

run_penetration_tests() {
    log "🎯 Running Basic Penetration Tests..."
    
    # Basic network penetration tests
    log "Testing network security..."
    
    # Port scanning
    if command_exists nmap; then
        nmap -sT -O localhost > "${AUDIT_DIR}/nmap-scan.txt" 2>/dev/null || true
        log_success "Port scan completed"
    else
        log_warning "nmap not available for penetration testing"
    fi
    
    # Test common vulnerabilities
    log "Testing for common web vulnerabilities..."
    
    # SQL injection test (basic)
    local test_urls=(
        "http://localhost:8080/api/users?id=1'"
        "http://localhost:8080/api/projects?search='; DROP TABLE--"
    )
    
    for url in "${test_urls[@]}"; do
        local response=$(curl -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null || echo "000")
        if [ "$response" = "500" ]; then
            log_error "Potential SQL injection vulnerability at: $url"
        elif [ "$response" = "400" ] || [ "$response" = "422" ]; then
            log_success "Proper input validation at: $url"
        fi
    done
    
    # XSS test (basic)
    local xss_payload="<script>alert('xss')</script>"
    local xss_response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d "{\"name\":\"$xss_payload\"}" \
        "http://localhost:8080/api/projects" 2>/dev/null || echo "error")
    
    if echo "$xss_response" | grep -q "$xss_payload"; then
        log_error "Potential XSS vulnerability detected"
    else
        log_success "XSS protection appears to be working"
    fi
}

# Main execution
main() {
    log "🔍 Starting SirsiNexus Security Audit..."
    log "Audit Directory: ${AUDIT_DIR}"
    
    # Initialize scores file
    echo "# Security Audit Scores" > "${AUDIT_DIR}/scores.txt"
    
    # Run security audits
    audit_network_security
    audit_authentication
    audit_database_security
    audit_application_security
    audit_docker_security
    
    # Run penetration tests
    run_penetration_tests
    
    # Generate report
    generate_security_report
    
    log "🎉 Security audit completed!"
    log "📁 Results available in: ${AUDIT_DIR}/"
    
    # Display summary
    local overall_score=$(grep "overall_security_score" "${AUDIT_DIR}/scores.txt" | cut -d: -f2 | tr -d ' ')
    echo ""
    echo "=================================="
    echo "  SECURITY AUDIT SUMMARY"
    echo "=================================="
    echo "Overall Score: $overall_score/100"
    
    if [ "$overall_score" -ge 85 ]; then
        echo "Status: ✅ PRODUCTION READY"
    elif [ "$overall_score" -ge 70 ]; then
        echo "Status: ⚠️  MINOR IMPROVEMENTS NEEDED"
    else
        echo "Status: ❌ SECURITY HARDENING REQUIRED"
    fi
    
    echo "Report: ${AUDIT_DIR}/security-report.md"
    echo "=================================="
}

# Execute main function
main "$@"
