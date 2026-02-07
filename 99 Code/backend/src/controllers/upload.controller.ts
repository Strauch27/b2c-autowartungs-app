/**
 * Upload Controller
 * Handles file upload HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { uploadConfig } from '../config/upload.config';

/**
 * Upload a single file
 */
export const uploadSingle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file provided',
      });
      return;
    }

    const { folder } = req.body;
    if (!folder) {
      res.status(400).json({
        success: false,
        error: 'Folder parameter is required',
      });
      return;
    }

    // Validate folder
    const validFolders = Object.values(uploadConfig.folders);
    if (!validFolders.includes(folder)) {
      res.status(400).json({
        success: false,
        error: `Invalid folder. Allowed folders: ${validFolders.join(', ')}`,
      });
      return;
    }

    // Extract metadata from request
    const metadata = {
      userId: (req.user as any)?.id,
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      description: req.body.description,
    };

    // Upload file
    const result = await uploadService.uploadFile(
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      folder,
      metadata
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple files
 */
export const uploadMultiple = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files provided',
      });
      return;
    }

    const { folder } = req.body;
    if (!folder) {
      res.status(400).json({
        success: false,
        error: 'Folder parameter is required',
      });
      return;
    }

    // Validate folder
    const validFolders = Object.values(uploadConfig.folders);
    if (!validFolders.includes(folder)) {
      res.status(400).json({
        success: false,
        error: `Invalid folder. Allowed folders: ${validFolders.join(', ')}`,
      });
      return;
    }

    // Extract metadata from request
    const metadata = {
      userId: (req.user as any)?.id,
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      description: req.body.description,
    };

    // Upload files
    const files = req.files.map((file) => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const results = await uploadService.uploadMultiple(files, folder, metadata);

    res.status(201).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.params.key as string;

    if (!key) {
      res.status(400).json({
        success: false,
        error: 'File key is required',
      });
      return;
    }

    await uploadService.deleteFile(decodeURIComponent(key));

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete multiple files
 */
export const deleteMultiple = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { keys } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      res.status(400).json({
        success: false,
        error: 'File keys array is required',
      });
      return;
    }

    await uploadService.deleteMultiple(keys);

    res.status(200).json({
      success: true,
      message: `${keys.length} file(s) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a signed URL for downloading
 */
export const generateSignedUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.params.key as string;
    const expiresIn = parseInt(req.query.expiresIn as string) || undefined;

    if (!key) {
      res.status(400).json({
        success: false,
        error: 'File key is required',
      });
      return;
    }

    const signedUrl = await uploadService.generateSignedUrl(
      decodeURIComponent(key),
      expiresIn
    );

    res.status(200).json({
      success: true,
      data: {
        signedUrl,
        expiresIn: expiresIn || uploadConfig.signedUrlExpiration.download,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a presigned URL for client-side upload
 */
export const generateUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folder, filename, mimeType } = req.body;

    if (!folder || !filename || !mimeType) {
      res.status(400).json({
        success: false,
        error: 'folder, filename, and mimeType are required',
      });
      return;
    }

    // Validate folder
    const validFolders = Object.values(uploadConfig.folders);
    if (!validFolders.includes(folder)) {
      res.status(400).json({
        success: false,
        error: `Invalid folder. Allowed folders: ${validFolders.join(', ')}`,
      });
      return;
    }

    const expiresIn = parseInt(req.body.expiresIn as string) || undefined;

    const result = await uploadService.generateUploadUrl(
      folder,
      filename,
      mimeType,
      expiresIn
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if file exists
 */
export const checkFileExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.params.key as string;

    if (!key) {
      res.status(400).json({
        success: false,
        error: 'File key is required',
      });
      return;
    }

    const exists = await uploadService.fileExists(decodeURIComponent(key));

    res.status(200).json({
      success: true,
      data: { exists },
    });
  } catch (error) {
    next(error);
  }
};
