#!/bin/bash
#
# ISHEBOT Security Audit Script
#
# This script performs a comprehensive security audit of the codebase
# to detect secrets, vulnerabilities, and security issues.
#
# Usage:
#   npm run security:audit
#   OR
#   bash scripts/security-audit.sh
#

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ISHEBOT Security Audit                               ║${NC}"
echo -e "${BLUE}║  Comprehensive Security Check                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

ISSUES=0
WARNINGS=0

# Create audit report directory
REPORT_DIR="security-audit-reports"
mkdir -p "$REPORT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/audit_${TIMESTAMP}.txt"

echo "Security Audit Report - $(date)" > "$REPORT_FILE"
echo "=====================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Function to log findings
log_issue() {
    local severity=$1
    local message=$2
    echo -e "${RED}❌ $severity: $message${NC}"
    echo "$severity: $message" >> "$REPORT_FILE"
    ISSUES=$((ISSUES + 1))
}

log_warning() {
    local message=$1
    echo -e "${YELLOW}⚠️  WARNING: $message${NC}"
    echo "WARNING: $message" >> "$REPORT_FILE"
    WARNINGS=$((WARNINGS + 1))
}

log_pass() {
    local message=$1
    echo -e "${GREEN}✓ $message${NC}"
    echo "PASS: $message" >> "$REPORT_FILE"
}

# ============================================================================
# 1. Check for .env files in repository
# ============================================================================
echo -e "\n${BLUE}[1] Checking for .env files in repository...${NC}"
ENV_IN_GIT=$(git ls-files | grep -E '^\.env$|^\.env\.' | grep -v '\.env\.example' | grep -v '\.env\.docker\.example' || true)
if [ ! -z "$ENV_IN_GIT" ]; then
    log_issue "CRITICAL" ".env file(s) found in git repository:"
    echo "$ENV_IN_GIT" | while read file; do
        echo -e "${RED}   - $file${NC}"
        echo "   - $file" >> "$REPORT_FILE"
    done
else
    log_pass "No .env files in repository"
fi

# ============================================================================
# 2. Check git history for accidentally committed secrets
# ============================================================================
echo -e "\n${BLUE}[2] Checking git history for .env files...${NC}"
ENV_IN_HISTORY=$(git log --all --full-history --source --remotes --pretty=format:'' --name-only -- '*.env' '.env.*' 2>/dev/null | grep -v '\.env\.example' | grep -v '\.env\.docker\.example' | sort -u || true)
if [ ! -z "$ENV_IN_HISTORY" ]; then
    log_issue "CRITICAL" ".env files found in git history (need removal):"
    echo "$ENV_IN_HISTORY" | while read file; do
        echo -e "${RED}   - $file${NC}"
        echo "   - $file" >> "$REPORT_FILE"
    done
    echo -e "${YELLOW}   💡 Use git filter-branch to remove from history${NC}"
else
    log_pass "No .env files in git history"
fi

# ============================================================================
# 3. Scan for hardcoded API keys
# ============================================================================
echo -e "\n${BLUE}[3] Scanning for hardcoded API keys...${NC}"

# OpenAI keys (sk-...)
OPENAI_KEYS=$(grep -r "sk-[a-zA-Z0-9]\{48\}" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".env.example" || true)
if [ ! -z "$OPENAI_KEYS" ]; then
    log_issue "CRITICAL" "OpenAI API keys found in code:"
    echo "$OPENAI_KEYS" | head -5 | while read line; do
        echo -e "${RED}   $line${NC}"
        echo "   $line" >> "$REPORT_FILE"
    done
else
    log_pass "No OpenAI API keys found in code"
fi

# Firebase keys (AIza...)
FIREBASE_KEYS=$(grep -r "AIza[a-zA-Z0-9_-]\{35\}" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".env.example" || true)
if [ ! -z "$FIREBASE_KEYS" ]; then
    log_warning "Firebase API keys found (verify if in .env or hardcoded):"
    echo "$FIREBASE_KEYS" | head -5 | while read line; do
        echo -e "${YELLOW}   $line${NC}"
    done
else
    log_pass "No Firebase API keys found in code"
fi

# AWS keys (AKIA...)
AWS_KEYS=$(grep -r "AKIA[0-9A-Z]\{16\}" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules || true)
if [ ! -z "$AWS_KEYS" ]; then
    log_issue "CRITICAL" "AWS access keys found in code"
    echo "$AWS_KEYS" | head -3
else
    log_pass "No AWS access keys found"
fi

# ============================================================================
# 4. Check for hardcoded passwords
# ============================================================================
echo -e "\n${BLUE}[4] Checking for hardcoded passwords...${NC}"
PASSWORDS=$(grep -r -iE "(password|passwd|pwd)['\"]?\s*[:=]\s*['\"][^'\"]{8,}" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | grep -v "password:" | grep -v "// password" | grep -v "placeholder" | head -10 || true)
if [ ! -z "$PASSWORDS" ]; then
    log_warning "Possible hardcoded passwords (review manually):"
    echo "$PASSWORDS" | head -5 | while read line; do
        echo -e "${YELLOW}   $line${NC}"
    done
else
    log_pass "No obvious hardcoded passwords found"
fi

# ============================================================================
# 5. Check for private keys
# ============================================================================
echo -e "\n${BLUE}[5] Checking for private key files...${NC}"
PRIVATE_KEYS=$(find . -type f \( -name "*.key" -o -name "*.pem" -o -name "*.p12" -o -name "*.pfx" \) ! -path "*/node_modules/*" || true)
if [ ! -z "$PRIVATE_KEYS" ]; then
    log_issue "CRITICAL" "Private key files found:"
    echo "$PRIVATE_KEYS" | while read file; do
        echo -e "${RED}   - $file${NC}"
        echo "   - $file" >> "$REPORT_FILE"
    done
else
    log_pass "No private key files found"
fi

# ============================================================================
# 6. Check for student/sensitive data files
# ============================================================================
echo -e "\n${BLUE}[6] Checking for student data files...${NC}"
DATA_FILES=$(find . -type f \( -name "*student*.csv" -o -name "*student*.xlsx" -o -name "*student*.xls" -o -name "*.db" -o -name "*.sqlite" \) ! -path "*/node_modules/*" || true)
if [ ! -z "$DATA_FILES" ]; then
    log_issue "HIGH" "Potential student data files found:"
    echo "$DATA_FILES" | while read file; do
        echo -e "${RED}   - $file${NC}"
        echo "   - $file" >> "$REPORT_FILE"
    done
else
    log_pass "No student data files found"
fi

# ============================================================================
# 7. Check .gitignore completeness
# ============================================================================
echo -e "\n${BLUE}[7] Checking .gitignore completeness...${NC}"
REQUIRED_IGNORES=(".env" "*.key" "*.pem" "node_modules" "dist" ".env.local" "*.csv" "*.xlsx")
MISSING_IGNORES=""
for pattern in "${REQUIRED_IGNORES[@]}"; do
    if ! grep -q "$pattern" .gitignore 2>/dev/null; then
        MISSING_IGNORES="$MISSING_IGNORES\n   - $pattern"
    fi
done

if [ ! -z "$MISSING_IGNORES" ]; then
    log_warning ".gitignore missing important patterns:$MISSING_IGNORES"
else
    log_pass ".gitignore is comprehensive"
fi

# ============================================================================
# 8. NPM Audit - Check for vulnerabilities
# ============================================================================
echo -e "\n${BLUE}[8] Running npm audit...${NC}"
if command -v npm &> /dev/null; then
    npm audit --audit-level=moderate > "$REPORT_DIR/npm-audit_${TIMESTAMP}.json" 2>&1 || true

    CRITICAL_VULNS=$(npm audit --json 2>/dev/null | grep -o '"critical":[0-9]*' | cut -d: -f2 || echo "0")
    HIGH_VULNS=$(npm audit --json 2>/dev/null | grep -o '"high":[0-9]*' | cut -d: -f2 || echo "0")

    if [ "$CRITICAL_VULNS" -gt 0 ]; then
        log_issue "CRITICAL" "$CRITICAL_VULNS critical npm vulnerabilities found"
        echo -e "${YELLOW}   💡 Run: npm audit fix${NC}"
    elif [ "$HIGH_VULNS" -gt 0 ]; then
        log_warning "$HIGH_VULNS high npm vulnerabilities found"
        echo -e "${YELLOW}   💡 Run: npm audit fix${NC}"
    else
        log_pass "No critical or high npm vulnerabilities"
    fi
else
    log_warning "npm not found, skipping vulnerability check"
fi

# ============================================================================
# 9. Check for debug code in production files
# ============================================================================
echo -e "\n${BLUE}[9] Checking for debug code...${NC}"
DEBUG_CODE=$(grep -r -E "(console\.log|debugger|TODO|FIXME|XXX|HACK)" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" src/ 2>/dev/null | wc -l || echo "0")
if [ "$DEBUG_CODE" -gt 10 ]; then
    log_warning "$DEBUG_CODE instances of debug code found (console.log, debugger, TODO, etc.)"
    echo -e "${YELLOW}   💡 Review before production deployment${NC}"
elif [ "$DEBUG_CODE" -gt 0 ]; then
    log_pass "$DEBUG_CODE instances of debug code (acceptable)"
else
    log_pass "No debug code found"
fi

# ============================================================================
# 10. Check file permissions (Unix/Linux only)
# ============================================================================
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    echo -e "\n${BLUE}[10] Checking file permissions...${NC}"
    EXEC_FILES=$(find . -type f -perm /111 ! -path "*/node_modules/*" ! -path "*/.git/*" ! -name "*.sh" | head -10 || true)
    if [ ! -z "$EXEC_FILES" ]; then
        log_warning "Unexpected executable files found:"
        echo "$EXEC_FILES" | head -5 | while read file; do
            echo -e "${YELLOW}   - $file${NC}"
        done
    else
        log_pass "File permissions look good"
    fi
else
    echo -e "\n${BLUE}[10] Skipping file permission check (Windows)${NC}"
fi

# ============================================================================
# 11. Check for exposed secrets in package.json
# ============================================================================
echo -e "\n${BLUE}[11] Checking package.json for secrets...${NC}"
if [ -f "package.json" ]; then
    PKG_SECRETS=$(grep -iE "(password|secret|key|token)" package.json | grep -v "\"password\":" | grep -v "// " || true)
    if [ ! -z "$PKG_SECRETS" ]; then
        log_warning "Potential secrets in package.json:"
        echo -e "${YELLOW}$PKG_SECRETS${NC}"
    else
        log_pass "package.json looks clean"
    fi
fi

# ============================================================================
# 12. Check for security headers implementation
# ============================================================================
echo -e "\n${BLUE}[12] Checking for security headers configuration...${NC}"
SECURITY_HEADERS=("X-Frame-Options" "Content-Security-Policy" "Strict-Transport-Security")
HEADERS_FOUND=0
for header in "${SECURITY_HEADERS[@]}"; do
    if grep -r "$header" --include="*.js" --include="*.ts" --include="*.json" --include="*.md" . 2>/dev/null | grep -v node_modules | grep -q .; then
        HEADERS_FOUND=$((HEADERS_FOUND + 1))
    fi
done

if [ $HEADERS_FOUND -lt 2 ]; then
    log_warning "Security headers not fully implemented (found $HEADERS_FOUND/3)"
    echo -e "${YELLOW}   💡 See docs/security/DEPLOYMENT_SECURITY.md${NC}"
else
    log_pass "Security headers configuration found"
fi

# ============================================================================
# Summary
# ============================================================================
echo "" | tee -a "$REPORT_FILE"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Audit Summary                                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo "" | tee -a "$REPORT_FILE"

if [ $ISSUES -gt 0 ]; then
    echo -e "${RED}❌ CRITICAL ISSUES: $ISSUES${NC}" | tee -a "$REPORT_FILE"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS${NC}" | tee -a "$REPORT_FILE"
fi

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}" | tee -a "$REPORT_FILE"
else
    echo "" | tee -a "$REPORT_FILE"
    echo -e "${YELLOW}Review the issues above and take appropriate action.${NC}" | tee -a "$REPORT_FILE"
fi

echo "" | tee -a "$REPORT_FILE"
echo -e "Report saved to: ${BLUE}$REPORT_FILE${NC}"
echo ""

# Exit with error code if critical issues found
if [ $ISSUES -gt 0 ]; then
    exit 1
else
    exit 0
fi
