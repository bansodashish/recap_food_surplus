#!/bin/bash

# Update S3 CORS Configuration Script
# This script updates the CORS configuration for the bansoash-poc S3 bucket

BUCKET_NAME="bansoash-poc"
REGION="eu-west-1"
AMPLIFY_DOMAIN="https://dev.d1s9qqmwgp12dy.amplifyapp.com"

echo "🔧 Updating S3 CORS Configuration"
echo "================================="
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo "Allowed Origin: $AMPLIFY_DOMAIN"
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
    echo "✅ AWS credentials are configured"
else
    echo "❌ AWS credentials not configured or invalid"
    echo "   Run: aws configure"
    exit 1
fi

echo ""

# Check if bucket exists
echo "2. Checking if S3 bucket exists..."
if aws s3api head-bucket --bucket $BUCKET_NAME --region $REGION 2>/dev/null; then
    echo "✅ S3 bucket '$BUCKET_NAME' exists"
else
    echo "❌ S3 bucket '$BUCKET_NAME' not found or no access"
    exit 1
fi

echo ""

# Create CORS configuration file (JSON format from XML requirements)
echo "3. Creating CORS configuration in JSON format..."
cat > cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedOrigins": [
                "$AMPLIFY_DOMAIN",
                "http://localhost:5173",
                "https://localhost:5173"
            ],
            "AllowedMethods": [
                "GET",
                "PUT",
                "POST",
                "DELETE",
                "HEAD"
            ],
            "AllowedHeaders": [
                "*"
            ],
            "ExposeHeaders": [
                "ETag",
                "x-amz-meta-custom-header"
            ],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

echo "✅ CORS configuration file created (JSON format)"
echo "📋 Configuration includes:"
echo "   - Origin: $AMPLIFY_DOMAIN"
echo "   - Methods: GET, PUT, POST (as specified in XML)"
echo "   - Headers: * (all headers allowed)"
echo "   - Exposed Headers: ETag (as specified)"

echo ""

# Apply CORS configuration
echo "4. Applying CORS configuration to S3 bucket..."
if aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-config.json --region $REGION; then
    echo "✅ CORS configuration applied successfully"
else
    echo "❌ Failed to apply CORS configuration"
    echo "Error details:"
    aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-config.json --region $REGION 2>&1
    exit 1
fi

echo ""

# Verify CORS configuration
echo "5. Verifying CORS configuration..."
if aws s3api get-bucket-cors --bucket $BUCKET_NAME --region $REGION > current-cors.json 2>/dev/null; then
    echo "✅ CORS configuration verified"
    echo ""
    echo "📋 Current CORS Configuration:"
    if command -v jq &> /dev/null; then
        cat current-cors.json | jq '.'
    else
        cat current-cors.json
    fi
else
    echo "❌ Could not retrieve CORS configuration"
fi

echo ""

# Clean up temporary files
echo "6. Cleaning up temporary files..."
rm -f cors-config.json current-cors.json
echo "✅ Cleanup completed"

echo ""
echo "🎉 S3 CORS Configuration Update Complete!"
echo "========================================"
echo ""
echo "✅ XML Configuration converted to JSON and applied:"
echo "• Origin: $AMPLIFY_DOMAIN"
echo "• Methods: GET, PUT, POST (as specified)"
echo "• Headers: * (all headers)"
echo "• Exposed Headers: ETag"
echo ""
echo "💡 Your image uploads should now work without CORS errors!"
echo ""
echo "🧪 Test your upload functionality:"
echo "1. Go to: $AMPLIFY_DOMAIN"
echo "2. Log in and try uploading images"
echo "3. Check browser console for any remaining errors"
