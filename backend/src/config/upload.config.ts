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

  // AWS S3 Folder Structure
  folders: {
    jockeyPhotos: 'jockeys/photos',
    jockeyDocuments: 'jockeys/documents',
    workshopPhotos: 'workshops/photos',
    workshopDocuments: 'workshops/documents',
    vehiclePhotos: 'vehicles/photos',
    maintenancePhotos: 'maintenance/photos',
    maintenanceVideos: 'maintenance/videos',
    temp: 'temp',
  },

  // Signed URL Expiration (in seconds)
  signedUrlExpiration: {
    download: 3600, // 1 hour
    upload: 900, // 15 minutes
  },
};

// AWS S3 Configuration from environment variables
export const s3Config = {
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  bucket: process.env.AWS_S3_BUCKET || '',
};

// Validate S3 configuration
export const validateS3Config = (): boolean => {
  if (!s3Config.credentials.accessKeyId ||
      !s3Config.credentials.secretAccessKey ||
      !s3Config.bucket) {
    console.warn('⚠️  AWS S3 configuration is incomplete. File upload will not work.');
    return false;
  }
  return true;
};
