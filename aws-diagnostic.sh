#!/bin/bash

# AWS Infrastructure Diagnostic Script for eu-west-1_Y2tRumZ22
# This script checks what might have changed in your AWS Cognito setup

USER_POOL_ID="eu-west-1_Y2tRumZ22"
CLIENT_ID="flshpq7e5kdqa00fre30g0t9p"
REGION="eu-west-1"

echo "🔍 AWS Cognito Infrastructure Diagnostic"
echo "========================================"
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "   Install: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo "1. Checking AWS credentials..."
if aws sts get-caller-identity --region $REGION &> /dev/null; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region $REGION)
    echo "✅ AWS credentials are configured"
    echo "   Account ID: $ACCOUNT_ID"
else
    echo "❌ AWS credentials not configured or invalid"
    echo "   Run: aws configure"
    exit 1
fi

echo ""

# Check if User Pool exists
echo "2. Checking if User Pool exists..."
if aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID --region $REGION &> /dev/null; then
    echo "✅ User Pool exists"
    
    # Get User Pool details
    POOL_NAME=$(aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID --region $REGION --query 'UserPool.Name' --output text)
    POOL_STATUS=$(aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID --region $REGION --query 'UserPool.Status' --output text)
    echo "   Name: $POOL_NAME"
    echo "   Status: $POOL_STATUS"
    
    if [ "$POOL_STATUS" != "ENABLED" ]; then
        echo "⚠️  WARNING: User Pool status is not ENABLED"
    fi
else
    echo "❌ User Pool NOT FOUND"
    echo "   This is likely why authentication is failing!"
    echo ""
    echo "🔧 SOLUTION: Either the User Pool was deleted or the ID changed."
    echo "   List your User Pools:"
    echo "   aws cognito-idp list-user-pools --max-items 20 --region $REGION"
    exit 1
fi

echo ""

# Check if User Pool Client exists
echo "3. Checking if User Pool Client exists..."
if aws cognito-idp describe-user-pool-client --user-pool-id $USER_POOL_ID --client-id $CLIENT_ID --region $REGION &> /dev/null; then
    echo "✅ User Pool Client exists"
    
    # Get Client details
    CLIENT_NAME=$(aws cognito-idp describe-user-pool-client --user-pool-id $USER_POOL_ID --client-id $CLIENT_ID --region $REGION --query 'UserPoolClient.ClientName' --output text)
    echo "   Name: $CLIENT_NAME"
    
    # Check authentication flows
    AUTH_FLOWS=$(aws cognito-idp describe-user-pool-client --user-pool-id $USER_POOL_ID --client-id $CLIENT_ID --region $REGION --query 'UserPoolClient.ExplicitAuthFlows' --output text)
    echo "   Auth Flows: $AUTH_FLOWS"
    
    if [[ $AUTH_FLOWS == *"ALLOW_USER_PASSWORD_AUTH"* ]]; then
        echo "   ✅ ALLOW_USER_PASSWORD_AUTH is enabled"
    else
        echo "   ❌ ALLOW_USER_PASSWORD_AUTH is MISSING - This is likely the issue!"
        echo ""
        echo "🔧 SOLUTION: Enable ALLOW_USER_PASSWORD_AUTH"
        echo "   1. Go to AWS Console → Cognito → User pools → $USER_POOL_ID"
        echo "   2. Click 'App clients' → $CLIENT_ID → Edit"
        echo "   3. Enable 'ALLOW_USER_PASSWORD_AUTH' under Authentication flows"
        echo "   4. Save changes"
        echo ""
        echo "   Or use AWS CLI:"
        echo "   aws cognito-idp update-user-pool-client \\"
        echo "     --user-pool-id $USER_POOL_ID \\"
        echo "     --client-id $CLIENT_ID \\"
        echo "     --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH \\"
        echo "     --region $REGION"
    fi
else
    echo "❌ User Pool Client NOT FOUND"
    echo "   This is likely why authentication is failing!"
    echo ""
    echo "🔧 SOLUTION: Either the Client was deleted or the ID changed."
    echo "   List your User Pool Clients:"
    echo "   aws cognito-idp list-user-pool-clients --user-pool-id $USER_POOL_ID --region $REGION"
    exit 1
fi

echo ""

# Check User Pool Domain (if used)
echo "4. Checking User Pool Domain..."
DOMAIN_INFO=$(aws cognito-idp describe-user-pool-domain --domain recap-food-surplus --region $REGION 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ User Pool Domain exists"
else
    echo "ℹ️  No User Pool Domain configured (this is optional)"
fi

echo ""

# Summary
echo "📋 DIAGNOSTIC SUMMARY"
echo "===================="
echo "✅ = Working correctly"
echo "❌ = Issue found (likely cause of authentication failure)"
echo "⚠️  = Warning (potential issue)"
echo "ℹ️  = Information only"
echo ""
echo "If you found any ❌ issues above, those are likely causing your authentication problems."
echo ""
echo "💡 QUICK FIX: If ALLOW_USER_PASSWORD_AUTH is missing, run this command:"
echo "aws cognito-idp update-user-pool-client \\"
echo "  --user-pool-id $USER_POOL_ID \\"
echo "  --client-id $CLIENT_ID \\"
echo "  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH \\"
echo "  --region $REGION"
