/**
 * Upload Middleware
 * Configures Multer for handling multipart/form-data file uploads
 */

// @ts-ignore - multer types not installed
import multer from 'multer';
import { Request } from 'express';
import { uploadConfig } from '../config/upload.config';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Request,
  file: any,
  cb: multer.FileFilterCallback
): void => {
  const allAllowedTypes = [
    ...uploadConfig.allowedMimeTypes.image,
    ...uploadConfig.allowedMimeTypes.video,
  ];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: ${allAllowedTypes.join(', ')}`
      )
    );
  }
};

// Create multer instance for single file upload
export const uploadSingleFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSizes.video, // Use max video size as upper limit
  },
}).single('file');

// Create multer instance for multiple file uploads
export const uploadMultipleFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSizes.video,
    files: 10, // Maximum 10 files at once
  },
}).array('files', 10);

// Error handler for multer errors
export const handleMulterError = (
  error: any,
  req: Request,
  res: any,
  next: any
): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'File size exceeds maximum allowed size',
      });
      return;
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 10 files allowed',
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
    return;
  }

  next(error);
};
