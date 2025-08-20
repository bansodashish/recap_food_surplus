#!/bin/bash

# 🧹 Cleanup Script for Recap Food Surplus Project
# This script removes temporary files and configurations created during setup

echo "🧹 Starting cleanup of unnecessary files..."

# Navigate to project root
PROJECT_ROOT="/Users/bansoash/Downloads/git__recap_food_surplus/recap_food_surplus"
cd "$PROJECT_ROOT" || exit 1

# List of files/directories to remove
FILES_TO_REMOVE=(
    # Temporary AWS files
    "../trust-policy-auth.json"
    "../updated-trust-policy.json"
    
    # Diagnostic and test files
    "aws-diagnostic.sh"
    "verify-cognito-config.sh"
    "cognito-trust-policy.json"
    "bulletproof-setup.sh"
    
    # Unused configuration files
    "src/main-bulletproof.tsx"
    "src/amplify-config-v6.ts"
    
    # Documentation files (keep only essential ones)
    "AWS_COGNITO_IDENTITY_POOL_SETUP.md"
    
    # Test and diagnostic components (if not needed in production)
    "src/components/CognitoConfigTest.tsx"
    "src/services/cognitoTestService.ts"
    
    # CSV upload variations (keep only the main one)
    "src/services/csvUploadFixed.ts"
    "src/services/csvUploadSimple.ts"
    
    # Any backup or old page files
    "src/pages/AboutPage_old.tsx"
    "src/pages/BrowsePage_old.tsx" 
    "src/pages/DonatePage_old.tsx"
    "src/pages/RequestPage_old.tsx"
    "src/pages/SellPage_old.tsx"
    
    # Deployment guides (can be moved to docs folder)
    "documents/deployment-guides/"
)

# Remove files that exist
REMOVED_COUNT=0
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -e "$file" ]; then
        echo "🗑️  Removing: $file"
        rm -rf "$file"
        REMOVED_COUNT=$((REMOVED_COUNT + 1))
    else
        echo "⏭️  Skipping (not found): $file"
    fi
done

# Clean up empty directories
echo ""
echo "🧹 Cleaning up empty directories..."
find . -type d -empty -delete 2>/dev/null || true

# Clean npm cache and reinstall dependencies
echo ""
echo "🔄 Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

# Update .gitignore to exclude temporary files
echo ""
echo "📝 Updating .gitignore..."
cat >> .gitignore << 'EOF'

# Temporary AWS files
trust-policy*.json
cognito-trust-policy.json
aws-diagnostic.sh
verify-cognito-config.sh

# Development diagnostic files
src/components/CognitoConfigTest.tsx
src/services/cognitoTestService.ts

EOF

echo ""
echo "✅ Cleanup complete!"
echo "📊 Summary:"
echo "   - Removed $REMOVED_COUNT files/directories"
echo "   - Updated .gitignore"
echo "   - Cleaned npm cache"
echo ""
echo "🎯 Your application is now cleaned up and ready for production!"
echo "🌐 Access your app at: http://localhost:5173"
echo ""
echo "💡 Next steps:"
echo "   1. Test your application functionality"
echo "   2. Commit the changes to git"
echo "   3. Deploy to production when ready"
