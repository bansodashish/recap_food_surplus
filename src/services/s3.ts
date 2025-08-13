import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET || 'bansoash-poc';
const S3_REGION = import.meta.env.VITE_AWS_REGION || 'eu-west-1';

export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    // Validate AWS credentials on initialization
    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    
    if (!accessKeyId || !secretAccessKey) {
      console.error('⚠️  AWS S3 credentials missing! Please set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY in .env file');
      throw new Error('AWS S3 credentials are required for photo uploads. Please configure your environment variables.');
    }

    this.s3Client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      maxAttempts: 3, // Built-in retry logic
    });
  }

  // Generate unique filename
  private generateFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `food-items/${userId}/${timestamp}-${randomId}.${extension}`;
  }

  // Upload image to S3 with bulletproof error handling
  async uploadImage(file: File, userId: string): Promise<string> {
    try {
      // Additional validation before upload
      if (!file || file.size === 0) {
        throw new Error('Invalid file: File is empty or null');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 10MB`);
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        throw new Error(`Invalid file type: ${file.type}. Allowed: ${validTypes.join(', ')}`);
      }

      const fileName = this.generateFileName(file.name, userId);
      
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
      });

      await this.s3Client.send(command);
      
      // Verify upload by checking if URL is accessible (optional validation)
      const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fileName}`;
      
      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading image to S3:', error);
      
      // Provide detailed error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('InvalidAccessKeyId') || error.message.includes('SignatureDoesNotMatch')) {
          throw new Error('AWS S3 Authentication failed. Please check your AWS credentials in the .env file.');
        } else if (error.message.includes('NoSuchBucket')) {
          throw new Error(`S3 bucket "${S3_BUCKET}" does not exist. Please verify the bucket name.`);
        } else if (error.message.includes('AccessDenied')) {
          throw new Error('Access denied to S3 bucket. Please check your AWS IAM permissions.');
        } else if (error.name === 'NetworkingError' || error.message.includes('network')) {
          throw new Error('Network error occurred while uploading to S3. Please check your internet connection.');
        } else {
          throw new Error(`S3 upload failed: ${error.message}`);
        }
      }
      
      throw new Error('Unknown error occurred during S3 upload');
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files: File[], userId: string): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, userId));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  }

  // Delete image from S3
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract key from URL
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(-3).join('/'); // food-items/userId/filename
      
      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      throw new Error('Failed to delete image');
    }
  }

  // Generate presigned URL for secure uploads (alternative method)
  async getPresignedUrl(fileName: string, userId: string, fileType: string): Promise<string> {
    try {
      const key = this.generateFileName(fileName, userId);
      
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: fileType,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return signedUrl;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }
}

export const s3Service = new S3Service();
