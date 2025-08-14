# S3 Integration Setup Guide

This guide covers setting up AWS S3 for image storage in the Food Surplus application.

## Prerequisites

- AWS Account with IAM user access
- AWS CLI installed (optional but recommended)
- Valid AWS credentials

## Step 1: Create S3 Bucket

### Option A: Using AWS Console

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `your-app-food-surplus-images`)
4. Select region (recommend same region as Cognito: `eu-west-1`)
5. Configure settings:
   - **Block Public Access**: Keep default settings for security
   - **Bucket Versioning**: Enable (optional)
   - **Server-side encryption**: Enable with S3 managed keys

### Option B: Using AWS CLI

```bash
# Create the bucket
aws s3api create-bucket \
  --bucket your-app-food-surplus-images \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1

# Enable versioning (optional)
aws s3api put-bucket-versioning \
  --bucket your-app-food-surplus-images \
  --versioning-configuration Status=Enabled
```

## Step 2: Configure CORS Policy

Add CORS configuration to allow uploads from your web application:

### Using AWS Console:
1. Go to your bucket → Permissions → CORS
2. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:5173", "https://your-domain.com"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### Using AWS CLI:

```bash
# Create cors.json file with the above configuration
aws s3api put-bucket-cors \
  --bucket your-app-food-surplus-images \
  --cors-configuration file://cors.json
```

## Step 3: Create IAM User for S3 Access

### Using AWS Console:

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Users → Add user
3. User name: `food-surplus-s3-user`
4. Access type: Programmatic access
5. Attach existing policies directly:
   - Create custom policy with this JSON:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-app-food-surplus-images/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-app-food-surplus-images"
        }
    ]
}
```

6. Download and save the Access Key ID and Secret Access Key

### Using AWS CLI:

```bash
# Create IAM user
aws iam create-user --user-name food-surplus-s3-user

# Create policy
aws iam create-policy \
  --policy-name FoodSurplusS3Policy \
  --policy-document file://s3-policy.json

# Attach policy to user
aws iam attach-user-policy \
  --user-name food-surplus-s3-user \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/FoodSurplusS3Policy

# Create access key
aws iam create-access-key --user-name food-surplus-s3-user
```

## Step 4: Configure Environment Variables

Update your `.env.local` file with the S3 configuration:

```bash
# AWS S3 Configuration
VITE_AWS_ACCESS_KEY_ID=your_access_key_id_here
VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
VITE_S3_BUCKET=your-app-food-surplus-images
VITE_AWS_REGION=eu-west-1
```

## Step 5: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Login to your application
3. Go to "Add Item" page
4. Try uploading an image
5. Check your S3 bucket to verify the image was uploaded

## Step 6: Production Configuration

For production deployment:

### 1. Update CORS Origins
Update the CORS configuration to include your production domain:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["https://your-production-domain.com"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### 2. Set Production Environment Variables
Configure your production environment (Vercel, Netlify, etc.) with:

```bash
VITE_AWS_ACCESS_KEY_ID=your_production_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_production_secret_key
VITE_S3_BUCKET=your-production-bucket-name
VITE_AWS_REGION=eu-west-1
```

### 3. Consider Using IAM Roles
For enhanced security in production, consider using IAM roles instead of access keys, especially if deploying on AWS infrastructure.

## Security Best Practices

1. **Least Privilege**: Only grant necessary S3 permissions
2. **Environment Variables**: Never commit AWS credentials to version control
3. **Bucket Policies**: Consider additional bucket policies for enhanced security
4. **CloudFront**: Use CloudFront for better performance and security
5. **Encryption**: Enable S3 encryption at rest
6. **Access Logging**: Enable S3 access logging for audit trails

## Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Verify CORS configuration includes your domain
   - Check that all HTTP methods are allowed

2. **Access Denied**:
   - Verify IAM permissions are correct
   - Check bucket policies aren't blocking access

3. **Upload Failures**:
   - Verify AWS credentials are correct
   - Check bucket name and region settings

4. **Images Not Loading**:
   - Verify bucket has public read access if needed
   - Check image URLs are properly formatted

### Debug Mode:
Enable debug logging in the S3 service by adding console.log statements to track upload progress and error details.

## Next Steps

- Set up CloudFront distribution for better image delivery
- Implement image optimization and resizing
- Add image metadata and tagging
- Set up lifecycle policies for old images
- Consider implementing presigned URLs for better security

## Support

If you encounter issues:
1. Check AWS CloudTrail logs for detailed error information
2. Verify all environment variables are set correctly
3. Test S3 access using AWS CLI
4. Check browser network tab for detailed error messages
