import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET || 'bansoash-poc';
const S3_REGION = import.meta.env.VITE_AWS_REGION || 'eu-west-1';

export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  // Generate unique filename
  private generateFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `food-items/${userId}/${timestamp}-${randomId}.${extension}`;
  }

  // Upload image to S3
  async uploadImage(file: File, userId: string): Promise<string> {
    try {
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
      
      // Return the public URL
      return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Failed to upload image');
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
