/**
 * Upload Routes
 * Defines API endpoints for file uploads
 */

import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  handleMulterError,
} from '../middleware/upload.middleware';

const router = Router();

/**
 * @route   POST /api/upload/single
 * @desc    Upload a single file
 * @access  Private (requires authentication)
 * @body    file (multipart), folder (string), entityType?, entityId?, description?
 */
router.post(
  '/single',
  authenticate,
  uploadSingleFile,
  handleMulterError,
  uploadController.uploadSingle
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Private (requires authentication)
 * @body    files[] (multipart), folder (string), entityType?, entityId?, description?
 */
router.post(
  '/multiple',
  authenticate,
  uploadMultipleFiles,
  handleMulterError,
  uploadController.uploadMultiple
);

/**
 * @route   DELETE /api/upload/:key
 * @desc    Delete a file by key
 * @access  Private (requires authentication)
 * @param   key - S3 object key (URL encoded)
 */
router.delete('/:key', authenticate, uploadController.deleteFile);

/**
 * @route   POST /api/upload/delete-multiple
 * @desc    Delete multiple files
 * @access  Private (requires authentication)
 * @body    keys (array of strings)
 */
router.post(
  '/delete-multiple',
  authenticate,
  uploadController.deleteMultiple
);

/**
 * @route   GET /api/upload/signed-url/:key
 * @desc    Generate a signed URL for temporary access
 * @access  Private (requires authentication)
 * @param   key - S3 object key (URL encoded)
 * @query   expiresIn - Optional expiration time in seconds
 */
router.get(
  '/signed-url/:key',
  authenticate,
  uploadController.generateSignedUrl
);

/**
 * @route   POST /api/upload/generate-upload-url
 * @desc    Generate a presigned URL for client-side upload
 * @access  Private (requires authentication)
 * @body    folder (string), filename (string), mimeType (string), expiresIn?
 */
router.post(
  '/generate-upload-url',
  authenticate,
  uploadController.generateUploadUrl
);

/**
 * @route   GET /api/upload/exists/:key
 * @desc    Check if a file exists
 * @access  Private (requires authentication)
 * @param   key - S3 object key (URL encoded)
 */
router.get('/exists/:key', authenticate, uploadController.checkFileExists);

export default router;
