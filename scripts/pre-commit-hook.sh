#!/bin/bash
#
# ISHEBOT Pre-Commit Hook - Prevents Committing Secrets
#
# Installation:
#   cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# This hook will run automatically before each commit and check for:
# - API keys (OpenAI, Firebase, Google)
# - Passwords and secrets
# - .env files
# - Student data files
# - Private keys
#

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔒 Running ISHEBOT pre-commit security checks..."

# Counter for issues found
ISSUES=0

# Check for .env files
echo -n "  Checking for .env files... "
ENV_FILES=$(git diff --cached --name-only | grep -E '^\.env(\.|$)' | grep -v '\.env\.example' | grep -v '\.env\.docker\.example' || true)
if [ ! -z "$ENV_FILES" ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}❌ ERROR: Attempting to commit .env file(s):${NC}"
    echo "$ENV_FILES" | while read file; do
        echo -e "${RED}   - $file${NC}"
    done
    echo -e "${YELLOW}   💡 .env files should NEVER be committed (they contain secrets)${NC}"
    echo -e "${YELLOW}   💡 Use .env.example with placeholder values instead${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for API keys (OpenAI format: sk-...)
echo -n "  Checking for OpenAI API keys... "
OPENAI_KEYS=$(git diff --cached | grep -E 'sk-[a-zA-Z0-9]{48}' || true)
if [ ! -z "$OPENAI_KEYS" ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}❌ ERROR: Found OpenAI API key in staged changes:${NC}"
    echo "$OPENAI_KEYS" | head -3
    echo -e "${YELLOW}   💡 NEVER commit API keys - use environment variables${NC}"
    echo -e "${YELLOW}   💡 If committed, rotate the key immediately${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for Firebase API keys (format: AIza...)
echo -n "  Checking for Firebase API keys... "
FIREBASE_KEYS=$(git diff --cached | grep -E 'AIza[a-zA-Z0-9_-]{35}' || true)
if [ ! -z "$FIREBASE_KEYS" ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}❌ ERROR: Found Firebase API key in staged changes${NC}"
    echo -e "${YELLOW}   💡 Use environment variables for Firebase config${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for hardcoded passwords
echo -n "  Checking for hardcoded passwords... "
PASSWORDS=$(git diff --cached | grep -iE "(password|passwd|pwd)['\"]?\s*[:=]\s*['\"][^'\"]{8,}['\"]" || true)
if [ ! -z "$PASSWORDS" ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}❌ ERROR: Possible hardcoded password detected${NC}"
    echo -e "${YELLOW}   💡 Use environment variables for passwords${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for private keys
echo -n "  Checking for private keys... "
PRIVATE_KEYS=$(git diff --cached --name-only | grep -E '\.(key|pem|p12|pfx|cer|crt)$' || true)
if [ ! -z "$PRIVATE_KEYS" ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}❌ ERROR: Attempting to commit private key file(s):${NC}"
    echo "$PRIVATE_KEYS" | while read file; do
        echo -e "${RED}   - $file${NC}"
    done
    echo -e "${YELLOW}   💡 Private keys should NEVER be committed${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for student data files
echo -n "  Checking for student data files... "
STUDENT_DATA=$(git diff --cached --name-only | grep -iE 'student.*\.(csv|xlsx?|json)$' || true)
if [ ! -z "$STUDENT_DATA" ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}❌ ERROR: Attempting to commit student data file(s):${NC}"
    echo "$STUDENT_DATA" | while read file; do
        echo -e "${RED}   - $file${NC}"
    done
    echo -e "${YELLOW}   💡 Student data should NEVER be committed (privacy violation)${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for database files
echo -n "  Checking for database files... "
DB_FILES=$(git diff --cached --name-only | grep -E '\.(db|sqlite|sqlite3)$' || true)
if [ ! -z "$DB_FILES" ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}❌ ERROR: Attempting to commit database file(s):${NC}"
    echo "$DB_FILES" | while read file; do
        echo -e "${RED}   - $file${NC}"
    done
    echo -e "${YELLOW}   💡 Database files should not be committed${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for AWS credentials
echo -n "  Checking for AWS credentials... "
AWS_CREDS=$(git diff --cached | grep -E 'AKIA[0-9A-Z]{16}' || true)
if [ ! -z "$AWS_CREDS" ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}❌ ERROR: Found AWS access key in staged changes${NC}"
    echo -e "${YELLOW}   💡 Rotate the key immediately if committed${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for Google service account keys
echo -n "  Checking for Google service account keys... "
GOOGLE_KEYS=$(git diff --cached --name-only | grep -E 'credentials\.json|service-account.*\.json' || true)
if [ ! -z "$GOOGLE_KEYS" ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}❌ ERROR: Attempting to commit Google service account key${NC}"
    echo -e "${YELLOW}   💡 These should NEVER be committed${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for large files (>1MB) - might contain data
echo -n "  Checking for large files... "
LARGE_FILES=$(git diff --cached --name-only | while read file; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        if [ $size -gt 1048576 ]; then  # 1MB
            echo "$file ($(numfmt --to=iec-i --suffix=B $size))"
        fi
    fi
done)
if [ ! -z "$LARGE_FILES" ]; then
    echo -e "${YELLOW}WARNING${NC}"
    echo -e "${YELLOW}⚠️  WARNING: Large file(s) detected:${NC}"
    echo "$LARGE_FILES" | while read file; do
        echo -e "${YELLOW}   - $file${NC}"
    done
    echo -e "${YELLOW}   💡 Ensure this is not student data or binary secrets${NC}"
    # This is a warning, not an error
else
    echo -e "${GREEN}✓${NC}"
fi

# Check for suspicious patterns in code
echo -n "  Checking for suspicious patterns... "
SUSPICIOUS=$(git diff --cached | grep -iE '(todo|fixme|hack|xxx|console\.log|debugger)' | head -5 || true)
if [ ! -z "$SUSPICIOUS" ]; then
    echo -e "${YELLOW}WARNING${NC}"
    echo -e "${YELLOW}⚠️  WARNING: Found TODO/FIXME/console.log in code${NC}"
    echo -e "${YELLOW}   💡 Review before committing to production${NC}"
    # This is a warning, not an error
else
    echo -e "${GREEN}✓${NC}"
fi

# Summary
echo ""
if [ $ISSUES -gt 0 ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ COMMIT BLOCKED - $ISSUES security issue(s) found${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}To fix:${NC}"
    echo -e "${YELLOW}1. Remove sensitive files: git reset HEAD <file>${NC}"
    echo -e "${YELLOW}2. Add to .gitignore if needed${NC}"
    echo -e "${YELLOW}3. Use environment variables for secrets${NC}"
    echo ""
    echo -e "${YELLOW}To bypass (NOT RECOMMENDED):${NC}"
    echo -e "${YELLOW}git commit --no-verify${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 0
fi
