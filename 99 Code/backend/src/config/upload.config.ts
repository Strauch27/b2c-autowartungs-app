/**
 * Upload Configuration
 * Defines file upload settings, allowed types, and size limits
 */

export const uploadConfig = {
  // File Size Limits (in bytes)
  maxFileSizes: {
    image: 10 * 1024 * 1024, // 10MB for images
    video: 50 * 1024 * 1024, // 50MB for videos
  },

  // Allowed MIME Types
  allowedMimeTypes: {
    image: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ],
    video: [
      'video/mp4',
      'video/quicktime', // MOV files
      'video/x-m4v',
    ],
  },

  // Image Processing Settings
  imageProcessing: {
    thumbnail: {
      width: 200,
      height: 200,
      fit: 'cover' as const,
    },
    medium: {
      width: 800,
      height: 800,
      fit: 'inside' as const,
    },
    large: {
      width: 1920,
      height: 1920,
      fit: 'inside' as const,
    },
    quality: 85,
  },

  // Blob Storage Folder Structure
  folders: {
    jockeyPhotos: 'jockeys/photos',
    jockeyDocuments: 'jockeys/documents',
    workshopPhotos: 'workshops/photos',
    workshopDocuments: 'workshops/documents',
    vehiclePhotos: 'vehicles/photos',
    maintenancePhotos: 'maintenance/photos',
    maintenanceVideos: 'maintenance/videos',
    extensionMedia: 'extensions/media',
    temp: 'temp',
  },

  // Signed URL Expiration (in seconds)
  signedUrlExpiration: {
    download: 3600, // 1 hour
    upload: 900, // 15 minutes
  },
};

// Azure Blob Storage Configuration from environment variables
export const azureBlobConfig = {
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
  containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads',
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
};

export const validateStorageConfig = (): boolean => {
  if (!azureBlobConfig.accountName && !azureBlobConfig.connectionString) {
    console.warn('⚠️  Azure Blob Storage configuration is incomplete. File upload will not work.');
    return false;
  }
  return true;
};
