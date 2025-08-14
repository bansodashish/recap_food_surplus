#!/bin/bash

echo "🚀 AWS AMPLIFY ENVIRONMENT VARIABLES SETUP"
echo "==========================================="
echo ""

echo "📋 COPY THESE EXACT VARIABLES TO AWS AMPLIFY CONSOLE:"
echo "-----------------------------------------------------"
echo ""

echo "Variable Name: VITE_AWS_REGION"
echo "Value: eu-west-1"
echo ""

echo "Variable Name: VITE_S3_BUCKET"
echo "Value: bansoash-poc"
echo ""

echo "Variable Name: VITE_AWS_USER_POOLS_ID"
echo "Value: eu-west-1_Y2tRumZ22"
echo ""

echo "Variable Name: VITE_AWS_USER_POOLS_WEB_CLIENT_ID"
echo "Value: [YOU NEED TO FIND THIS - SEE INSTRUCTIONS BELOW]"
echo ""

echo "Variable Name: VITE_AWS_COGNITO_IDENTITY_POOL_ID"
echo "Value: eu-west-1:c12d8304-37ee-4a49-bedb-32b3c4c2d078"
echo ""

echo "🔍 HOW TO FIND YOUR COGNITO WEB CLIENT ID:"
echo "-------------------------------------------"
echo "1. Go to AWS Console → Cognito → User Pools"
echo "2. Select pool: eu-west-1_Y2tRumZ22 (recap-food-surplus-users)"
echo "3. Go to 'App integration' tab"
echo "4. Find your app client and copy the 'Client ID'"
echo ""
echo "OR use AWS CLI:"
echo "aws cognito-idp list-user-pool-clients --user-pool-id eu-west-1_Y2tRumZ22 --region eu-west-1"
echo ""

echo "📍 WHERE TO ADD THESE IN AWS AMPLIFY:"
echo "------------------------------------"
echo "1. Go to AWS Amplify Console"
echo "2. Select your app"
echo "3. Go to 'App settings' → 'Environment variables'"
echo "4. Click 'Manage variables'"
echo "5. Add each variable with its exact name and value"
echo "6. Save and redeploy"
