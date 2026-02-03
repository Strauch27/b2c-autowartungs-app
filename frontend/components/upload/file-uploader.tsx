/**
 * File Uploader Component
 * Drag & drop file uploader with progress tracking
 */

'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, FileIcon, ImageIcon, VideoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileUpload, UploadResult } from '@/lib/hooks/use-file-upload';
import { UploadProgress } from './upload-progress';
import { ImagePreview } from './image-preview';

interface FileUploaderProps {
  folder: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  accept?: 'image' | 'video' | 'all';
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete?: (results: UploadResult | UploadResult[]) => void;
  onError?: (error: Error) => void;
  className?: string;
}

const ACCEPT_TYPES = {
  image: 'image/jpeg,image/jpg,image/png,image/webp',
  video: 'video/mp4,video/quicktime,video/x-m4v',
  all: 'image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime,video/x-m4v',
};

const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  folder,
  entityType,
  entityId,
  description,
  accept = 'all',
  multiple = false,
  maxFiles = 10,
  onUploadComplete,
  onError,
  className,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploadMultiple, uploading, progress, error } = useFileUpload();

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // Validate number of files
      if (!multiple && fileArray.length > 1) {
        onError?.(new Error('Only one file is allowed'));
        return;
      }

      if (fileArray.length > maxFiles) {
        onError?.(new Error(`Maximum ${maxFiles} files allowed`));
        return;
      }

      // Validate file types and sizes
      const validFiles: File[] = [];
      for (const file of fileArray) {
        // Check file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (accept === 'image' && !isImage) {
          onError?.(new Error(`Only image files are allowed`));
          continue;
        }

        if (accept === 'video' && !isVideo) {
          onError?.(new Error(`Only video files are allowed`));
          continue;
        }

        // Check file size
        const maxSize = isImage ? MAX_FILE_SIZES.image : MAX_FILE_SIZES.video;
        if (file.size > maxSize) {
          const maxSizeMB = maxSize / (1024 * 1024);
          onError?.(new Error(`File ${file.name} exceeds ${maxSizeMB}MB limit`));
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setSelectedFiles(validFiles);

      // Generate previews for images
      const previewUrls: string[] = [];
      validFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          previewUrls.push(url);
        } else {
          previewUrls.push('');
        }
      });
      setPreviews(previewUrls);
    },
    [accept, multiple, maxFiles, onError]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
  );

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    try {
      if (multiple && selectedFiles.length > 1) {
        const results = await uploadMultiple(selectedFiles, {
          folder,
          entityType,
          entityId,
          description,
          onError,
        });

        if (results) {
          onUploadComplete?.(results);
          setSelectedFiles([]);
          setPreviews([]);
        }
      } else {
        const result = await uploadFile(selectedFiles[0], {
          folder,
          entityType,
          entityId,
          description,
          onError,
        });

        if (result) {
          onUploadComplete?.(result);
          setSelectedFiles([]);
          setPreviews([]);
        }
      }
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error('Upload failed');
      onError?.(uploadError);
    }
  }, [
    selectedFiles,
    multiple,
    uploadFile,
    uploadMultiple,
    folder,
    entityType,
    entityId,
    description,
    onUploadComplete,
    onError,
  ]);

  // Remove selected file
  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke object URL
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
  }, []);

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    if (file.type.startsWith('video/')) {
      return <VideoIcon className="h-8 w-8 text-purple-500" />;
    }
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse
        </p>
        <p className="text-xs text-gray-400">
          {accept === 'image' && 'Accepts: JPEG, PNG, WebP (max 10MB)'}
          {accept === 'video' && 'Accepts: MP4, MOV (max 50MB)'}
          {accept === 'all' && 'Accepts: Images (max 10MB), Videos (max 50MB)'}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_TYPES[accept]}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                {previews[index] ? (
                  <ImagePreview src={previews[index]} alt={file.name} />
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4">
                    {getFileIcon(file)}
                    <p className="text-xs text-gray-600 mt-2 truncate w-full text-center">
                      {file.name}
                    </p>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && <UploadProgress progress={progress.percentage} />}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      )}

      {/* Upload button */}
      {selectedFiles.length > 0 && !uploading && (
        <button
          onClick={handleUpload}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
        </button>
      )}
    </div>
  );
};
