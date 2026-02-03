/**
 * Upload Types
 * TypeScript type definitions for file upload functionality
 */

export interface UploadResult {
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

export interface UploadMetadata {
  userId?: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  [key: string]: any;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  folder: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: UploadResult | UploadResult[]) => void;
  onError?: (error: Error) => void;
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresIn: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export interface FileExistsResponse {
  exists: boolean;
}

export type UploadFolder =
  | 'jockeys/photos'
  | 'jockeys/documents'
  | 'workshops/photos'
  | 'workshops/documents'
  | 'vehicles/photos'
  | 'maintenance/photos'
  | 'maintenance/videos'
  | 'temp';

export type AcceptType = 'image' | 'video' | 'all';

export const UPLOAD_CONFIG = {
  maxFileSizes: {
    image: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024, // 50MB
  },
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    video: ['video/mp4', 'video/quicktime', 'video/x-m4v'],
  },
  maxFiles: 10,
} as const;
