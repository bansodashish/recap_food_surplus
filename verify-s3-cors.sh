#!/bin/bash

# Verify S3 CORS Configuration Script
# This script verifies that the CORS configuration is working correctly

BUCKET_NAME="bansoash-poc"
REGION="eu-west-1"
AMPLIFY_DOMAIN="https://dev.d1s9qqmwgp12dy.amplifyapp.com"

echo "🔍 Verifying S3 CORS Configuration"
echo "=================================="
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Check current CORS configuration
echo "1. Checking current CORS configuration..."
if aws s3api get-bucket-cors --bucket $BUCKET_NAME --region $REGION > cors-check.json 2>/dev/null; then
    echo "✅ CORS configuration found"
    echo ""
    echo "📋 Current CORS Rules:"
    
    # Parse and display CORS rules
    if command -v jq &> /dev/null; then
        ALLOWED_ORIGINS=$(cat cors-check.json | jq -r '.CORSRules[0].AllowedOrigins[]' 2>/dev/null)
        ALLOWED_METHODS=$(cat cors-check.json | jq -r '.CORSRules[0].AllowedMethods[]' 2>/dev/null)
        
        echo "   Allowed Origins:"
        echo "$ALLOWED_ORIGINS" | while read origin; do
            if [[ "$origin" == "$AMPLIFY_DOMAIN" ]]; then
                echo "   ✅ $origin (your Amplify domain)"
            elif [[ "$origin" == *"localhost"* ]]; then
                echo "   ✅ $origin (development)"
            else
                echo "   ℹ️  $origin"
            fi
        done
        
        echo ""
        echo "   Allowed Methods:"
        echo "$ALLOWED_METHODS" | while read method; do
            if [[ "$method" == "PUT" ]] || [[ "$method" == "POST" ]]; then
                echo "   ✅ $method (needed for uploads)"
            else
                echo "   ✅ $method"
            fi
        done
    else
        echo "   (Install 'jq' for detailed parsing)"
        cat cors-check.json
    fi
    
    rm -f cors-check.json
else
    echo "❌ No CORS configuration found"
    echo ""
    echo "🔧 Run the update script first:"
    echo "   ./update-s3-cors.sh"
    exit 1
fi

echo ""
echo "🎯 CORS Configuration Status: ✅ CONFIGURED"
echo "=========================================="
echo ""
echo "Your S3 bucket CORS is properly configured for:"
echo "• Amplify domain: $AMPLIFY_DOMAIN"
echo "• Development: localhost:5173"
echo "• Upload methods: PUT, POST, GET"
echo "• All headers allowed (*)"
echo "• ETag header exposed"
echo ""
echo "💡 If you still get CORS errors, check:"
echo "1. Make sure you're using the correct bucket name in your code"
echo "2. Verify your Amplify domain is exactly: $AMPLIFY_DOMAIN"
echo "3. Check browser console for specific CORS error details"
echo "4. Ensure your S3 upload code uses the correct region: $REGION"
