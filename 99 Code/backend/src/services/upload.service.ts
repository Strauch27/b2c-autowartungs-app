/**
 * Upload Service
 * Handles file uploads to AWS S3 with image processing
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { s3Config, uploadConfig, validateS3Config } from '../config/upload.config';

interface UploadMetadata {
  userId?: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  [key: string]: any;
}

interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  metadata?: UploadMetadata;
  variants?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
}

interface FileBuffer {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

class UploadService {
  private s3Client: S3Client;
  private bucket: string;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = validateS3Config();
    this.bucket = s3Config.bucket;
    this.s3Client = new S3Client({
      region: s3Config.region,
      credentials: s3Config.credentials,
    });
  }

  /**
   * Upload a single file to S3
   */
  async uploadFile(
    file: FileBuffer,
    folder: string,
    metadata?: UploadMetadata
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('S3 configuration is incomplete');
    }

    // Validate file type
    this.validateFileType(file.mimetype);

    // Validate file size
    this.validateFileSize(file.size, file.mimetype);

    // Generate unique key
    const key = this.generateKey(folder, file.originalname);

    // Process image if needed
    let processedBuffer = file.buffer;
    let variants: UploadResult['variants'] = undefined;

    if (this.isImageType(file.mimetype)) {
      // Optimize main image
      processedBuffer = await this.optimizeImage(file.buffer);

      // Generate variants
      variants = await this.generateImageVariants(file.buffer, folder, key);
    }

    // Upload to S3
    const uploadParams = {
      Bucket: this.bucket,
      Key: key,
      Body: processedBuffer,
      ContentType: file.mimetype,
      Metadata: this.sanitizeMetadata(metadata),
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));

    const url = this.getPublicUrl(key);

    return {
      url,
      key,
      size: processedBuffer.length,
      mimeType: file.mimetype,
      metadata,
      variants,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: FileBuffer[],
    folder: string,
    metadata?: UploadMetadata
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, folder, metadata)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from S3 by URL or key
   */
  async deleteFile(fileUrlOrKey: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('S3 configuration is incomplete');
    }

    const key = this.extractKeyFromUrl(fileUrlOrKey);

    const deleteParams = {
      Bucket: this.bucket,
      Key: key,
    };

    await this.s3Client.send(new DeleteObjectCommand(deleteParams));
  }

  /**
   * Delete multiple files
   */
  async deleteMultiple(fileUrlsOrKeys: string[]): Promise<void> {
    const deletePromises = fileUrlsOrKeys.map((urlOrKey) =>
      this.deleteFile(urlOrKey)
    );

    await Promise.all(deletePromises);
  }

  /**
   * Generate a signed URL for temporary access
   */
  async generateSignedUrl(
    fileUrlOrKey: string,
    expiresIn: number = uploadConfig.signedUrlExpiration.download
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('S3 configuration is incomplete');
    }

    const key = this.extractKeyFromUrl(fileUrlOrKey);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Generate a presigned upload URL for client-side uploads
   */
  async generateUploadUrl(
    folder: string,
    filename: string,
    mimeType: string,
    expiresIn: number = uploadConfig.signedUrlExpiration.upload
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    if (!this.isConfigured) {
      throw new Error('S3 configuration is incomplete');
    }

    this.validateFileType(mimeType);

    const key = this.generateKey(folder, filename);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    const publicUrl = this.getPublicUrl(key);

    return { uploadUrl, key, publicUrl };
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(fileUrlOrKey: string): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const key = this.extractKeyFromUrl(fileUrlOrKey);

      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Validate file type
   */
  private validateFileType(mimeType: string): void {
    const allAllowedTypes = [
      ...uploadConfig.allowedMimeTypes.image,
      ...uploadConfig.allowedMimeTypes.video,
    ];

    if (!allAllowedTypes.includes(mimeType)) {
      throw new Error(
        `Invalid file type: ${mimeType}. Allowed types: ${allAllowedTypes.join(', ')}`
      );
    }
  }

  /**
   * Validate file size
   */
  private validateFileSize(size: number, mimeType: string): void {
    const maxSize = this.isImageType(mimeType)
      ? uploadConfig.maxFileSizes.image
      : uploadConfig.maxFileSizes.video;

    if (size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      throw new Error(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB`
      );
    }
  }

  /**
   * Check if mime type is an image
   */
  private isImageType(mimeType: string): boolean {
    return uploadConfig.allowedMimeTypes.image.includes(mimeType);
  }

  /**
   * Generate a unique S3 key
   */
  private generateKey(folder: string, filename: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = filename.split('.').pop();
    const sanitizedFilename = filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100);

    return `${folder}/${timestamp}-${randomString}-${sanitizedFilename}`;
  }

  /**
   * Extract S3 key from URL
   */
  private extractKeyFromUrl(urlOrKey: string): string {
    // If it's already a key (no http), return as is
    if (!urlOrKey.startsWith('http')) {
      return urlOrKey;
    }

    // Extract key from S3 URL
    const url = new URL(urlOrKey);
    return url.pathname.substring(1); // Remove leading slash
  }

  /**
   * Get public URL for S3 object
   */
  private getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`;
  }

  /**
   * Sanitize metadata for S3 (only string values allowed)
   */
  private sanitizeMetadata(metadata?: UploadMetadata): Record<string, string> {
    if (!metadata) return {};

    const sanitized: Record<string, string> = {};

    Object.entries(metadata).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = value;
      } else if (value !== null && value !== undefined) {
        sanitized[key] = String(value);
      }
    });

    return sanitized;
  }

  /**
   * Optimize image using Sharp
   */
  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(uploadConfig.imageProcessing.large.width, uploadConfig.imageProcessing.large.height, {
        fit: uploadConfig.imageProcessing.large.fit,
        withoutEnlargement: true,
      })
      .jpeg({ quality: uploadConfig.imageProcessing.quality, progressive: true })
      .toBuffer();
  }

  /**
   * Generate image variants (thumbnail, medium, large)
   */
  private async generateImageVariants(
    buffer: Buffer,
    folder: string,
    originalKey: string
  ): Promise<UploadResult['variants']> {
    const variants: UploadResult['variants'] = {};

    try {
      // Generate thumbnail
      const thumbnailBuffer = await sharp(buffer)
        .resize(
          uploadConfig.imageProcessing.thumbnail.width,
          uploadConfig.imageProcessing.thumbnail.height,
          { fit: uploadConfig.imageProcessing.thumbnail.fit }
        )
        .jpeg({ quality: uploadConfig.imageProcessing.quality })
        .toBuffer();

      const thumbnailKey = originalKey.replace(/(\.[^.]+)$/, '-thumbnail$1');
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
        })
      );
      variants.thumbnail = this.getPublicUrl(thumbnailKey);

      // Generate medium
      const mediumBuffer = await sharp(buffer)
        .resize(
          uploadConfig.imageProcessing.medium.width,
          uploadConfig.imageProcessing.medium.height,
          { fit: uploadConfig.imageProcessing.medium.fit }
        )
        .jpeg({ quality: uploadConfig.imageProcessing.quality })
        .toBuffer();

      const mediumKey = originalKey.replace(/(\.[^.]+)$/, '-medium$1');
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: mediumKey,
          Body: mediumBuffer,
          ContentType: 'image/jpeg',
        })
      );
      variants.medium = this.getPublicUrl(mediumKey);
    } catch (error) {
      console.error('Error generating image variants:', error);
      // Continue without variants if generation fails
    }

    return variants;
  }
}

// Export singleton instance
export const uploadService = new UploadService();
