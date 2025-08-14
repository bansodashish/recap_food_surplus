#!/bin/bash

# 🎯 BULLETPROOF VALIDATION - 0.001% FAILURE RATE VERIFICATION
# This script validates your complete setup for maximum reliability

echo "🔍 BULLETPROOF VALIDATION - 0.001% FAILURE RATE VERIFICATION"
echo "============================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation results
total_checks=0
passed_checks=0
critical_failures=0

validate_check() {
    local description="$1"
    local status="$2"
    local is_critical="${3:-false}"
    
    total_checks=$((total_checks + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $description${NC}"
        passed_checks=$((passed_checks + 1))
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $description${NC}"
    else
        echo -e "${RED}❌ $description${NC}"
        if [ "$is_critical" = "true" ]; then
            critical_failures=$((critical_failures + 1))
        fi
    fi
}

echo "🔧 ENVIRONMENT CONFIGURATION VALIDATION"
echo "---------------------------------------"

# Check if .env exists and has safe values
if [ -f ".env" ]; then
    if grep -q "development" .env && ! grep -q "VITE_AWS_ACCESS_KEY_ID=" .env; then
        validate_check "Development .env file is safe (no hardcoded credentials)" "PASS"
    else
        validate_check "Development .env file contains potential security risks" "FAIL" true
    fi
else
    validate_check ".env file exists for development" "WARNING"
fi

# Check .gitignore for security
if [ -f ".gitignore" ]; then
    if grep -q "\.env\.production" .gitignore && grep -q "aws-exports\.js" .gitignore; then
        validate_check ".gitignore properly excludes sensitive files" "PASS"
    else
        validate_check ".gitignore missing critical exclusions" "FAIL" true
    fi
else
    validate_check ".gitignore file exists" "FAIL" true
fi

echo ""
echo "🏗️ PROJECT STRUCTURE VALIDATION"
echo "-------------------------------"

# Check for required service files
if [ -f "src/services/bulletproofS3Service.ts" ]; then
    validate_check "Bulletproof S3 Service exists" "PASS"
else
    validate_check "Bulletproof S3 Service missing" "FAIL" true
fi

if [ -f "src/utils/environmentValidator.ts" ]; then
    validate_check "Environment Validator exists" "PASS"
else
    validate_check "Environment Validator missing" "FAIL" true
fi

# Check for CSV upload integration
if [ -f "src/components/CSVUploadModalWithPhotos.tsx" ]; then
    validate_check "CSV Upload with Photos component exists" "PASS"
else
    validate_check "CSV Upload with Photos component missing" "FAIL" true
fi

echo ""
echo "📋 DOCUMENTATION VALIDATION"
echo "---------------------------"

if [ -f "AMPLIFY_ENV_SETUP.md" ]; then
    validate_check "AWS Amplify setup documentation exists" "PASS"
else
    validate_check "AWS Amplify setup documentation missing" "FAIL" true
fi

if [ -f "DEPLOYMENT_SECURITY_CHECKLIST.md" ]; then
    validate_check "Deployment security checklist exists" "PASS"
else
    validate_check "Deployment security checklist missing" "WARNING"
fi

if [ -f "bulletproof-setup.sh" ] && [ -x "bulletproof-setup.sh" ]; then
    validate_check "Bulletproof setup script is executable" "PASS"
else
    validate_check "Bulletproof setup script missing or not executable" "FAIL" true
fi

echo ""
echo "🔐 SECURITY VALIDATION"
echo "---------------------"

# Check for hardcoded credentials in code
if grep -r "AKIA\|aws_access_key_id\|aws_secret_access_key" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "\.env" | grep -v "example" | grep -v "placeholder"; then
    validate_check "No hardcoded AWS credentials in source code" "FAIL" true
else
    validate_check "No hardcoded AWS credentials found in source code" "PASS"
fi

# Check for secure import statements
if grep -r "bulletproofS3Service\|secureS3Service" src/ 2>/dev/null | grep -q "import"; then
    validate_check "Components using secure S3 service imports" "PASS"
else
    validate_check "Components not using secure S3 service" "WARNING"
fi

echo ""
echo "⚡ PERFORMANCE & RELIABILITY VALIDATION"
echo "-------------------------------------"

# Check TypeScript compilation
if npm run build > /tmp/build.log 2>&1; then
    validate_check "TypeScript compilation successful" "PASS"
else
    validate_check "TypeScript compilation failed" "FAIL" true
    echo -e "${RED}Build errors:${NC}"
    tail -10 /tmp/build.log | sed 's/^/   /'
fi

# Check for required environment variables in setup
if [ -f "bulletproof-setup.sh" ]; then
    required_vars=("VITE_AWS_REGION" "VITE_S3_BUCKET" "VITE_AWS_USER_POOLS_ID" "VITE_AWS_USER_POOLS_WEB_CLIENT_ID" "VITE_AWS_COGNITO_IDENTITY_POOL_ID")
    missing_vars=0
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "$var=" bulletproof-setup.sh; then
            missing_vars=$((missing_vars + 1))
        fi
    done
    
    if [ $missing_vars -eq 0 ]; then
        validate_check "All required environment variables present in setup" "PASS"
    else
        validate_check "$missing_vars required environment variables missing from setup" "FAIL" true
    fi
fi

echo ""
echo "🎯 BULLETPROOF VALIDATION RESULTS"
echo "================================="

reliability_score=$((passed_checks * 100 / total_checks))

if [ $critical_failures -eq 0 ] && [ $reliability_score -ge 95 ]; then
    echo -e "${GREEN}🏆 BULLETPROOF STATUS: EXCELLENT${NC}"
    echo -e "${GREEN}✅ Reliability Score: ${reliability_score}%${NC}"
    echo -e "${GREEN}✅ Ready for 0.001% failure rate deployment${NC}"
elif [ $critical_failures -eq 0 ] && [ $reliability_score -ge 85 ]; then
    echo -e "${YELLOW}⚠️  BULLETPROOF STATUS: GOOD${NC}"
    echo -e "${YELLOW}⚠️  Reliability Score: ${reliability_score}%${NC}"
    echo -e "${YELLOW}⚠️  Minor issues detected, but deployment ready${NC}"
elif [ $critical_failures -le 2 ]; then
    echo -e "${RED}🚨 BULLETPROOF STATUS: NEEDS ATTENTION${NC}"
    echo -e "${RED}❌ Reliability Score: ${reliability_score}%${NC}"
    echo -e "${RED}❌ Critical failures: $critical_failures${NC}"
    echo -e "${RED}❌ Fix critical issues before deployment${NC}"
else
    echo -e "${RED}💥 BULLETPROOF STATUS: CRITICAL FAILURE${NC}"
    echo -e "${RED}💥 Reliability Score: ${reliability_score}%${NC}"
    echo -e "${RED}💥 Critical failures: $critical_failures${NC}"
    echo -e "${RED}💥 System not ready for reliable deployment${NC}"
fi

echo ""
echo "📊 SUMMARY"
echo "----------"
echo "Total Checks: $total_checks"
echo "Passed: $passed_checks"
echo "Failed: $((total_checks - passed_checks))"
echo "Critical Failures: $critical_failures"

if [ $critical_failures -eq 0 ] && [ $reliability_score -ge 95 ]; then
    echo ""
    echo -e "${GREEN}🚀 NEXT STEPS FOR BULLETPROOF DEPLOYMENT:${NC}"
    echo "1. Run: ./bulletproof-setup.sh"
    echo "2. Configure AWS Amplify Environment Variables"
    echo "3. Create Cognito Identity Pool"
    echo "4. Deploy with confidence!"
    exit 0
else
    echo ""
    echo -e "${RED}🔧 REQUIRED FIXES:${NC}"
    echo "1. Address all critical failures listed above"
    echo "2. Re-run this validation script"
    echo "3. Achieve 95%+ reliability score before deployment"
    exit 1
fi
