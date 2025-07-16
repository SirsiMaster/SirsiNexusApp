#!/bin/bash

# SirsiNexus Enhanced Security Audit
# Phase 5.5 Security Hardening

echo "🔐 Running Enhanced Security Audit..."

AUDIT_DATE=$(date +"%Y%m%d_%H%M%S")
AUDIT_DIR="security-audit-enhanced-${AUDIT_DATE}"
mkdir -p "${AUDIT_DIR}"

echo "=== SirsiNexus Enhanced Security Audit ===" > "${AUDIT_DIR}/security-report.md"
echo "**Date**: $(date)" >> "${AUDIT_DIR}/security-report.md"
echo "" >> "${AUDIT_DIR}/security-report.md"

# 1. Dependency Vulnerability Scan
echo "📦 Scanning Dependencies for Vulnerabilities..."
echo "## Dependency Vulnerabilities" >> "${AUDIT_DIR}/security-report.md"

cd ui
if command -v npm >/dev/null; then
  npm audit --audit-level=moderate > "../${AUDIT_DIR}/npm-audit.txt" 2>&1
  vulnerability_count=$(grep -c "vulnerabilities" "../${AUDIT_DIR}/npm-audit.txt" || echo "0")
  echo "- Frontend vulnerabilities: $vulnerability_count" >> "../${AUDIT_DIR}/security-report.md"
fi
cd ..

# 2. Rust Security Audit
echo "🦀 Auditing Rust Dependencies..."
cd core-engine
if command -v cargo >/dev/null; then
  cargo audit 2>&1 | tee "../${AUDIT_DIR}/cargo-audit.txt"
  if grep -q "error" "../${AUDIT_DIR}/cargo-audit.txt"; then
    echo "- Rust security issues found" >> "../${AUDIT_DIR}/security-report.md"
  else
    echo "- Rust dependencies: ✅ Clean" >> "../${AUDIT_DIR}/security-report.md"
  fi
fi
cd ..

# 3. Configuration Security Check
echo "⚙️ Checking Configuration Security..."
echo "## Configuration Security" >> "${AUDIT_DIR}/security-report.md"

# Check for exposed secrets
if find . -name "*.env*" -not -path "./node_modules/*" | xargs grep -l "password\|secret\|key" 2>/dev/null; then
  echo "- ⚠️ Environment files contain potential secrets" >> "${AUDIT_DIR}/security-report.md"
else
  echo "- ✅ No exposed secrets in environment files" >> "${AUDIT_DIR}/security-report.md"
fi

# 4. Network Security Scan
echo "🌐 Scanning Network Security..."
echo "## Network Security" >> "${AUDIT_DIR}/security-report.md"

# Check for open ports
netstat -tuln > "${AUDIT_DIR}/open-ports.txt" 2>/dev/null || ss -tuln > "${AUDIT_DIR}/open-ports.txt"
open_ports=$(wc -l < "${AUDIT_DIR}/open-ports.txt")
echo "- Open network connections: $open_ports" >> "${AUDIT_DIR}/security-report.md"

# 5. Generate Security Score
echo "📊 Calculating Security Score..."
score=100

# Deduct points based on findings
if [ "$vulnerability_count" -gt 0 ]; then
  score=$((score - vulnerability_count * 5))
fi

if grep -q "error" "${AUDIT_DIR}/cargo-audit.txt" 2>/dev/null; then
  score=$((score - 20))
fi

echo "## Overall Security Score: $score/100" >> "${AUDIT_DIR}/security-report.md"

if [ "$score" -ge 90 ]; then
  echo "🟢 **Security Status**: EXCELLENT" >> "${AUDIT_DIR}/security-report.md"
elif [ "$score" -ge 80 ]; then
  echo "🟡 **Security Status**: GOOD" >> "${AUDIT_DIR}/security-report.md"
elif [ "$score" -ge 70 ]; then
  echo "🟠 **Security Status**: NEEDS ATTENTION" >> "${AUDIT_DIR}/security-report.md"
else
  echo "🔴 **Security Status**: CRITICAL" >> "${AUDIT_DIR}/security-report.md"
fi

echo "✅ Enhanced security audit complete! Report: ${AUDIT_DIR}/security-report.md"
