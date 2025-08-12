# 🚀 AWS Amplify Environment Variables Configuration

## Required for S3 CSV Upload System

```bash
# Core AWS Configuration (REQUIRED)
VITE_AWS_REGION=eu-west-1
VITE_AWS_COGNITO_USER_POOL_ID=eu-west-1_Y2tRumZ22
VITE_AWS_COGNITO_APP_CLIENT_ID=flshpq7e5kdqa00fre30g0t9p

# S3 Configuration (REQUIRED for CSV uploads)
VITE_AWS_ACCESS_KEY_ID=<your-aws-access-key>
VITE_AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
VITE_S3_BUCKET=bansoash-poc

# API Configuration (Optional - system falls back to localStorage)
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/prod

# Feature Toggles
VITE_ENABLE_SUBSCRIPTION_FEATURES=true
VITE_ENABLE_PAYMENT_PROCESSING=true

# Payment Processing (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

## AWS Amplify Console Setup:

1. Environment Variables → Add all variables above
2. Build Settings → Use the build configuration from the deployment guide
3. Deploy from `dev` branch

## ✅ Ready for Production!
