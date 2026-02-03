/**
 * File Upload Hook
 * React hook for handling file uploads with progress tracking
 */

'use client';

import { useState, useCallback } from 'react';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  variants?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
}

export interface UseFileUploadOptions {
  folder: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: UploadResult | UploadResult[]) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<Error | null>(null);

  /**
   * Upload a single file
   */
  const uploadFile = useCallback(
    async (
      file: File,
      options: UseFileUploadOptions
    ): Promise<UploadResult | null> => {
      try {
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', options.folder);

        if (options.entityType) {
          formData.append('entityType', options.entityType);
        }
        if (options.entityId) {
          formData.append('entityId', options.entityId);
        }
        if (options.description) {
          formData.append('description', options.description);
        }

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progressData = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
            };
            setProgress(progressData);
            options.onProgress?.(progressData);
          }
        });

        // Create promise to handle upload
        const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve(response.data);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
          });
        });

        xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/upload/single`);

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);

        const result = await uploadPromise;
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error('Upload failed');
        setError(uploadError);
        options.onError?.(uploadError);
        return null;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  /**
   * Upload multiple files
   */
  const uploadMultiple = useCallback(
    async (
      files: File[],
      options: UseFileUploadOptions
    ): Promise<UploadResult[] | null> => {
      try {
        setUploading(true);
        setError(null);

        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('folder', options.folder);

        if (options.entityType) {
          formData.append('entityType', options.entityType);
        }
        if (options.entityId) {
          formData.append('entityId', options.entityId);
        }
        if (options.description) {
          formData.append('description', options.description);
        }

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progressData = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
            };
            setProgress(progressData);
            options.onProgress?.(progressData);
          }
        });

        // Create promise to handle upload
        const uploadPromise = new Promise<UploadResult[]>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve(response.data);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
          });
        });

        xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/upload/multiple`);

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);

        const result = await uploadPromise;
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error('Upload failed');
        setError(uploadError);
        options.onError?.(uploadError);
        return null;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  /**
   * Delete a file
   */
  const deleteFile = useCallback(async (key: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/${encodeURIComponent(key)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      return true;
    } catch (err) {
      const deleteError = err instanceof Error ? err : new Error('Delete failed');
      setError(deleteError);
      return false;
    }
  }, []);

  return {
    uploadFile,
    uploadMultiple,
    deleteFile,
    uploading,
    progress,
    error,
  };
};
