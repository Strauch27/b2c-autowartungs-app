/**
 * Upload Service
 * Handles file uploads to Azure Blob Storage with image processing
 */

import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import sharp from 'sharp';
import { azureBlobConfig, uploadConfig, validateStorageConfig } from '../config/upload.config';

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
  private containerClient: ContainerClient;
  private blobServiceClient: BlobServiceClient;
  private isConfigured: boolean;
  private accountName: string;
  private containerName: string;

  constructor() {
    this.isConfigured = validateStorageConfig();
    this.accountName = azureBlobConfig.accountName;
    this.containerName = azureBlobConfig.containerName;

    if (azureBlobConfig.connectionString) {
      // Use connection string (local development / explicit credentials)
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        azureBlobConfig.connectionString
      );
    } else if (this.accountName) {
      // Use Managed Identity (Azure-hosted environments)
      const credential = new DefaultAzureCredential();
      this.blobServiceClient = new BlobServiceClient(
        `https://${this.accountName}.blob.core.windows.net`,
        credential
      );
    } else {
      // Fallback: create a placeholder client (isConfigured will be false)
      this.blobServiceClient = new BlobServiceClient(
        'https://placeholder.blob.core.windows.net'
      );
    }

    this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
  }

  /**
   * Upload a single file to Azure Blob Storage
   */
  async uploadFile(
    file: FileBuffer,
    folder: string,
    metadata?: UploadMetadata
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('Azure Blob Storage configuration is incomplete');
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

    // Upload to Azure Blob Storage
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    await blockBlobClient.uploadData(processedBuffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
      metadata: this.sanitizeMetadata(metadata),
    });

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
   * Delete a file from Azure Blob Storage by URL or key
   */
  async deleteFile(fileUrlOrKey: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Azure Blob Storage configuration is incomplete');
    }

    const key = this.extractKeyFromUrl(fileUrlOrKey);
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    await blockBlobClient.delete();
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
   * Generate a signed URL for temporary download access
   */
  async generateSignedUrl(
    fileUrlOrKey: string,
    expiresIn: number = uploadConfig.signedUrlExpiration.download
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Azure Blob Storage configuration is incomplete');
    }

    const key = this.extractKeyFromUrl(fileUrlOrKey);
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);

    // Use user delegation key with DefaultAzureCredential, or
    // fall back to generating SAS from connection string
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + expiresIn * 1000);

    if (azureBlobConfig.connectionString) {
      // Extract account name and key from connection string for SAS generation
      const sasUrl = await this.generateSasUrl(key, BlobSASPermissions.parse('r'), expiresOn);
      return sasUrl;
    }

    // For Managed Identity, use user delegation SAS
    const userDelegationKey = await this.blobServiceClient.getUserDelegationKey(startsOn, expiresOn);
    const sasParams = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: key,
        permissions: BlobSASPermissions.parse('r'),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      userDelegationKey,
      this.accountName
    );

    return `${blockBlobClient.url}?${sasParams.toString()}`;
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
      throw new Error('Azure Blob Storage configuration is incomplete');
    }

    this.validateFileType(mimeType);

    const key = this.generateKey(folder, filename);
    const expiresOn = new Date(Date.now() + expiresIn * 1000);

    const blockBlobClient = this.containerClient.getBlockBlobClient(key);

    if (azureBlobConfig.connectionString) {
      const uploadUrl = await this.generateSasUrl(key, BlobSASPermissions.parse('cw'), expiresOn);
      const publicUrl = this.getPublicUrl(key);
      return { uploadUrl, key, publicUrl };
    }

    // For Managed Identity, use user delegation SAS
    const startsOn = new Date();
    const userDelegationKey = await this.blobServiceClient.getUserDelegationKey(startsOn, expiresOn);
    const sasParams = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: key,
        permissions: BlobSASPermissions.parse('cw'),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      userDelegationKey,
      this.accountName
    );

    const uploadUrl = `${blockBlobClient.url}?${sasParams.toString()}`;
    const publicUrl = this.getPublicUrl(key);

    return { uploadUrl, key, publicUrl };
  }

  /**
   * Check if a file exists in Azure Blob Storage
   */
  async fileExists(fileUrlOrKey: string): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const key = this.extractKeyFromUrl(fileUrlOrKey);
      const blockBlobClient = this.containerClient.getBlockBlobClient(key);
      await blockBlobClient.getProperties();
      return true;
    } catch (error) {
      return false;
    }
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Generate a SAS URL using connection string credentials
   */
  private async generateSasUrl(
    blobName: string,
    permissions: BlobSASPermissions,
    expiresOn: Date
  ): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    // Parse account name and key from connection string
    const accountNameMatch = azureBlobConfig.connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = azureBlobConfig.connectionString.match(/AccountKey=([^;]+)/);

    if (!accountNameMatch || !accountKeyMatch) {
      throw new Error('Unable to parse Azure Storage connection string');
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountNameMatch[1],
      accountKeyMatch[1]
    );

    const sasParams = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions,
        startsOn: new Date(),
        expiresOn,
        protocol: SASProtocol.Https,
      },
      sharedKeyCredential
    );

    return `${blockBlobClient.url}?${sasParams.toString()}`;
  }

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
   * Generate a unique blob key
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
   * Extract blob key from URL
   */
  private extractKeyFromUrl(urlOrKey: string): string {
    // If it's already a key (no http), return as is
    if (!urlOrKey.startsWith('http')) {
      return urlOrKey;
    }

    // Extract key from Azure Blob Storage URL
    // URL format: https://{account}.blob.core.windows.net/{container}/{key}
    const url = new URL(urlOrKey);
    const pathParts = url.pathname.split('/');
    // Remove leading empty string and container name, rejoin the rest as key
    return pathParts.slice(2).join('/');
  }

  /**
   * Get public URL for a blob
   */
  private getPublicUrl(key: string): string {
    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${key}`;
  }

  /**
   * Sanitize metadata for Azure Blob Storage (only string values allowed)
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
      const thumbnailBlob = this.containerClient.getBlockBlobClient(thumbnailKey);
      await thumbnailBlob.uploadData(thumbnailBuffer, {
        blobHTTPHeaders: { blobContentType: 'image/jpeg' },
      });
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
      const mediumBlob = this.containerClient.getBlockBlobClient(mediumKey);
      await mediumBlob.uploadData(mediumBuffer, {
        blobHTTPHeaders: { blobContentType: 'image/jpeg' },
      });
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
