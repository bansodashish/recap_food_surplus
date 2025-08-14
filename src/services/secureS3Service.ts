import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';

// Secure S3 Configuration - Environment variables managed by AWS Amplify
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET || 'bansoash-poc';
const S3_REGION = import.meta.env.VITE_AWS_REGION || 'eu-west-1';
const COGNITO_IDENTITY_POOL_ID = import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID;
const USER_POOLS_ID = import.meta.env.VITE_AWS_USER_POOLS_ID;

export class SecureS3Service {
  private s3Client: S3Client | null = null;

  // Initialize S3 client with Cognito temporary credentials (secure approach)
  private async initializeS3Client(): Promise<S3Client> {
    try {
      // Log environment info (safe for debugging)
      console.log(`🌍 Environment: ${import.meta.env.VITE_APP_ENV || 'development'}`);
      console.log(`📦 S3 Bucket: ${S3_BUCKET}`);
      console.log(`🌎 AWS Region: ${S3_REGION}`);

      // Method 1: Use Cognito Identity Pool (recommended for production)
      if (COGNITO_IDENTITY_POOL_ID) {
        console.log('🔐 Initializing secure S3 with Cognito Identity Pool...');
        
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated with Cognito');
        }

        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        
        if (!idToken) {
          throw new Error('Failed to get Cognito ID token');
        }

        const s3Client = new S3Client({
          region: S3_REGION,
          credentials: fromCognitoIdentityPool({
            client: new CognitoIdentityClient({ region: S3_REGION }),
            identityPoolId: COGNITO_IDENTITY_POOL_ID,
            logins: {
              [`cognito-idp.${S3_REGION}.amazonaws.com/${USER_POOLS_ID}`]: idToken,
            },
          }),
          maxAttempts: 3,
        });

        this.s3Client = s3Client;
        console.log('✅ Secure S3 client initialized with Cognito Identity Pool');
        return s3Client;
      }
      // Method 2: Fallback to Amplify session credentials
      console.log('⚠️  Cognito Identity Pool not configured - using Amplify session credentials');
      console.log('💡 For production, set up Cognito Identity Pool in AWS Amplify Environment Variables');
      
      const session = await fetchAuthSession();
      
      if (!session.credentials) {
        throw new Error('No authenticated session found - please login to access photo upload');
      }

      const s3Client = new S3Client({
        region: S3_REGION,
        credentials: session.credentials,
        maxAttempts: 3,
      });

      this.s3Client = s3Client;
      console.log('✅ S3 client initialized with Amplify session credentials');
      return s3Client;

    } catch (error) {
      console.error('❌ Failed to initialize secure S3 client:', error);
      
      // Enhanced error messages for Amplify environment
      if (error instanceof Error) {
        if (error.message.includes('not authenticated')) {
          throw new Error('🔐 Please login with your account to upload photos. Authentication is required for secure S3 access.');
        } else if (error.message.includes('COGNITO_IDENTITY_POOL_ID')) {
          throw new Error('🔧 Environment configuration missing. Please configure Cognito Identity Pool in AWS Amplify Environment Variables.');
        } else {
          throw new Error(`🔐 Authentication setup required: ${error.message}`);
        }
      }
      
      throw new Error('Authentication system initialization failed');
    }
  }

  // Ensure S3 client is ready before operations
  private async ensureS3Client(): Promise<S3Client> {
    if (!this.s3Client) {
      return await this.initializeS3Client();
    }
    return this.s3Client;
  }

  // Generate unique filename with user-specific path for security isolation
  private generateSecureFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `food-items/${userId}/${timestamp}-${randomId}.${extension}`;
  }

  // Secure upload with temporary Cognito credentials
  async uploadImage(file: File, userId: string): Promise<string> {
    try {
      // Comprehensive validation
      if (!file || file.size === 0) {
        throw new Error('Invalid file: File is empty or null');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`);
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        throw new Error(`Invalid file type: ${file.type}. Allowed: ${validTypes.join(', ')}`);
      }

      // Get authenticated S3 client with temporary credentials
      const s3Client = await this.ensureS3Client();
      const fileName = this.generateSecureFileName(file.name, userId);
      
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: fileName,
        Body: file,
        ContentType: file.type,
        Metadata: {
          userId,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
        ServerSideEncryption: 'AES256', // Server-side encryption
      });

      await s3Client.send(command);
      
      const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fileName}`;
      console.log(`✅ Securely uploaded ${file.name}: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error('❌ Secure S3 upload failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not authenticated') || error.message.includes('Authentication required')) {
          throw new Error('🔐 Please login to upload photos');
        } else if (error.message.includes('token') || error.message.includes('Cognito')) {
          throw new Error('🔐 Authentication expired - please refresh and try again');
        } else if (error.message.includes('AccessDenied')) {
          throw new Error('❌ Access denied - check Cognito Identity Pool permissions');
        } else if (error.message.includes('NoSuchBucket')) {
          throw new Error(`❌ S3 bucket "${S3_BUCKET}" not found`);
        } else if (error.name === 'NetworkingError') {
          throw new Error('🌐 Network error - check your internet connection');
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }
      
      throw new Error('Unknown upload error');
    }
  }

  // Secure batch upload
  async uploadMultipleImages(files: File[], userId: string): Promise<string[]> {
    try {
      await this.ensureS3Client(); // Validate auth before batch
      const results = await Promise.all(files.map(file => this.uploadImage(file, userId)));
      console.log(`✅ Batch uploaded ${results.length} images securely`);
      return results;
    } catch (error) {
      console.error('❌ Batch upload failed:', error);
      throw error;
    }
  }

  // Secure delete with user ownership validation
  async deleteImage(imageUrl: string, userId: string): Promise<void> {
    try {
      const s3Client = await this.ensureS3Client();
      
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(-3).join('/'); // food-items/userId/filename
      
      // Security: Users can only delete their own files
      if (!key.includes(`food-items/${userId}/`)) {
        throw new Error('❌ Access denied: Can only delete your own files');
      }
      
      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      });

      await s3Client.send(command);
      console.log(`✅ Securely deleted: ${key}`);
    } catch (error) {
      console.error('❌ Secure delete failed:', error);
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Refresh credentials when needed
  async refreshCredentials(): Promise<void> {
    console.log('🔄 Refreshing S3 credentials...');
    this.s3Client = null;
    await this.initializeS3Client();
    console.log('✅ Credentials refreshed');
  }
}

// Export both class and singleton instance for flexibility
export const secureS3Service = new SecureS3Service();
