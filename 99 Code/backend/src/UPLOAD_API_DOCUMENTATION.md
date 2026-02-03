# Upload API Documentation

Complete documentation for the File Upload Service using AWS S3.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [API Endpoints](#api-endpoints)
4. [File Types & Limits](#file-types--limits)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)

---

## Overview

The Upload Service provides secure file upload functionality with the following features:

- **AWS S3 Integration**: Reliable cloud storage with CDN capabilities
- **Image Processing**: Automatic image optimization and thumbnail generation
- **Progress Tracking**: Real-time upload progress monitoring
- **File Validation**: Type and size validation
- **Multiple Upload**: Support for single and batch uploads
- **Signed URLs**: Temporary secure access to private files
- **Image Variants**: Automatic generation of thumbnail, medium, and large variants

---

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-bucket-name
```

### AWS S3 Setup

1. **Create an S3 Bucket**:
   - Log in to AWS Console
   - Navigate to S3
   - Create a new bucket (e.g., `your-app-uploads`)
   - Choose region: `eu-central-1` (or your preferred region)

2. **Configure Bucket Permissions**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

3. **Enable CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

4. **Create IAM User**:
   - Navigate to IAM > Users
   - Create new user with programmatic access
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save Access Key ID and Secret Access Key

---

## API Endpoints

All endpoints require authentication via JWT token in Authorization header.

### 1. Upload Single File

**POST** `/api/upload/single`

Upload a single file to S3.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body** (multipart/form-data):
- `file` (required): File to upload
- `folder` (required): Target folder (see [Folder Structure](#folder-structure))
- `entityType` (optional): Entity type (e.g., "jockey", "workshop")
- `entityId` (optional): Entity ID
- `description` (optional): File description

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://bucket.s3.region.amazonaws.com/path/to/file.jpg",
    "key": "jockeys/photos/1234567890-abc123-filename.jpg",
    "size": 1234567,
    "mimeType": "image/jpeg",
    "metadata": {
      "userId": "user-123",
      "entityType": "jockey",
      "entityId": "jockey-456"
    },
    "variants": {
      "thumbnail": "https://bucket.s3.region.amazonaws.com/path/to/file-thumbnail.jpg",
      "medium": "https://bucket.s3.region.amazonaws.com/path/to/file-medium.jpg"
    }
  }
}
```

---

### 2. Upload Multiple Files

**POST** `/api/upload/multiple`

Upload multiple files at once (max 10 files).

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body** (multipart/form-data):
- `files[]` (required): Array of files to upload
- `folder` (required): Target folder
- `entityType` (optional): Entity type
- `entityId` (optional): Entity ID
- `description` (optional): Files description

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "url": "https://bucket.s3.region.amazonaws.com/path/to/file1.jpg",
      "key": "workshops/photos/1234567890-abc123-file1.jpg",
      "size": 1234567,
      "mimeType": "image/jpeg",
      "variants": { ... }
    },
    {
      "url": "https://bucket.s3.region.amazonaws.com/path/to/file2.jpg",
      "key": "workshops/photos/1234567891-def456-file2.jpg",
      "size": 2345678,
      "mimeType": "image/jpeg",
      "variants": { ... }
    }
  ]
}
```

---

### 3. Delete File

**DELETE** `/api/upload/:key`

Delete a file from S3 by its key.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `key` (required): URL-encoded S3 object key

**Response**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### 4. Delete Multiple Files

**POST** `/api/upload/delete-multiple`

Delete multiple files at once.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body**:
```json
{
  "keys": [
    "jockeys/photos/1234567890-abc123-file1.jpg",
    "jockeys/photos/1234567891-def456-file2.jpg"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "2 file(s) deleted successfully"
}
```

---

### 5. Generate Signed URL

**GET** `/api/upload/signed-url/:key`

Generate a temporary signed URL for accessing a private file.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `key` (required): URL-encoded S3 object key

**Query Parameters**:
- `expiresIn` (optional): Expiration time in seconds (default: 3600)

**Response**:
```json
{
  "success": true,
  "data": {
    "signedUrl": "https://bucket.s3.region.amazonaws.com/path/to/file.jpg?AWSAccessKeyId=...&Expires=...&Signature=...",
    "expiresIn": 3600
  }
}
```

---

### 6. Generate Upload URL

**POST** `/api/upload/generate-upload-url`

Generate a presigned URL for client-side direct upload to S3.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body**:
```json
{
  "folder": "jockeys/photos",
  "filename": "profile-photo.jpg",
  "mimeType": "image/jpeg",
  "expiresIn": 900
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://bucket.s3.region.amazonaws.com/path/to/file.jpg?AWSAccessKeyId=...&Expires=...&Signature=...",
    "key": "jockeys/photos/1234567890-abc123-profile-photo.jpg",
    "publicUrl": "https://bucket.s3.region.amazonaws.com/path/to/file.jpg"
  }
}
```

---

### 7. Check File Exists

**GET** `/api/upload/exists/:key`

Check if a file exists in S3.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `key` (required): URL-encoded S3 object key

**Response**:
```json
{
  "success": true,
  "data": {
    "exists": true
  }
}
```

---

## File Types & Limits

### Allowed File Types

**Images**:
- JPEG/JPG
- PNG
- WebP

**Videos**:
- MP4
- MOV (QuickTime)
- M4V

### File Size Limits

- **Images**: 10 MB maximum
- **Videos**: 50 MB maximum

### Folder Structure

Available folders for file uploads:

- `jockeys/photos` - Jockey profile photos
- `jockeys/documents` - Jockey documents (licenses, certificates)
- `workshops/photos` - Workshop facility photos
- `workshops/documents` - Workshop documents
- `vehicles/photos` - Vehicle photos
- `maintenance/photos` - Maintenance service photos
- `maintenance/videos` - Maintenance service videos
- `temp` - Temporary uploads

---

## Usage Examples

### Frontend - Using the FileUploader Component

```tsx
import { FileUploader } from '@/components/upload';

function MyComponent() {
  const handleUploadComplete = (result) => {
    console.log('Upload successful:', result);
    // Save the URL to your database
  };

  return (
    <FileUploader
      folder="jockeys/photos"
      entityType="jockey"
      entityId="jockey-123"
      accept="image"
      multiple={false}
      onUploadComplete={handleUploadComplete}
    />
  );
}
```

### Frontend - Using the Upload Hook

```tsx
import { useFileUpload } from '@/lib/hooks/use-file-upload';

function MyComponent() {
  const { uploadFile, uploading, progress } = useFileUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, {
      folder: 'workshops/photos',
      entityType: 'workshop',
      entityId: 'workshop-456',
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress.percentage}%`);
      },
    });

    if (result) {
      console.log('File uploaded:', result.url);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {uploading && <p>Uploading: {progress.percentage}%</p>}
    </div>
  );
}
```

### Backend - Using the Upload Service

```typescript
import { uploadService } from '../services/upload.service';

// Upload a file
const result = await uploadService.uploadFile(
  {
    buffer: fileBuffer,
    originalname: 'photo.jpg',
    mimetype: 'image/jpeg',
    size: 123456,
  },
  'jockeys/photos',
  {
    userId: 'user-123',
    entityType: 'jockey',
    entityId: 'jockey-456',
  }
);

// Delete a file
await uploadService.deleteFile(result.key);

// Generate signed URL
const signedUrl = await uploadService.generateSignedUrl(result.key, 3600);
```

---

## Error Handling

### Common Error Responses

**Invalid File Type**:
```json
{
  "success": false,
  "error": "Invalid file type: application/pdf. Allowed types: image/jpeg, image/jpg, image/png, image/webp"
}
```

**File Too Large**:
```json
{
  "success": false,
  "error": "File size exceeds maximum allowed size of 10MB"
}
```

**Invalid Folder**:
```json
{
  "success": false,
  "error": "Invalid folder. Allowed folders: jockeys/photos, workshops/photos, ..."
}
```

**S3 Configuration Missing**:
```json
{
  "success": false,
  "error": "S3 configuration is incomplete"
}
```

**Authentication Required**:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## Image Processing

When uploading images, the service automatically:

1. **Optimizes** the main image (max 1920x1920px, 85% quality)
2. **Generates variants**:
   - **Thumbnail**: 200x200px (cover fit)
   - **Medium**: 800x800px (inside fit)
   - **Large**: Original optimized image

All images are converted to JPEG format with progressive encoding for better web performance.

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **File Validation**: Server-side validation of file types and sizes
3. **Sanitization**: Filenames are sanitized to prevent path traversal
4. **Signed URLs**: Use signed URLs for temporary access to private files
5. **CORS**: Configure CORS to restrict access to your domain only
6. **Rate Limiting**: Consider implementing rate limiting for upload endpoints

---

## Best Practices

1. **Use variants**: For images, use thumbnail/medium variants instead of full-size URLs for better performance
2. **Clean up**: Delete old files when they're no longer needed
3. **Validate client-side**: Validate file types and sizes on the client before uploading
4. **Show progress**: Use progress tracking for better UX
5. **Error handling**: Always handle upload errors gracefully
6. **Metadata**: Include relevant metadata (entityType, entityId) for better organization

---

## Troubleshooting

### Upload fails with 403 Forbidden

- Check AWS credentials in `.env`
- Verify IAM user has S3 permissions
- Check bucket CORS configuration

### Images not loading

- Verify bucket policy allows public read access
- Check if S3 bucket name is correct
- Ensure CORS is configured properly

### Slow uploads

- Consider using presigned URLs for direct client-to-S3 uploads
- Enable CloudFront CDN for faster delivery
- Optimize images before upload

---

## Future Enhancements

- [ ] Video transcoding support
- [ ] Advanced image filters and effects
- [ ] Integration with CloudFront CDN
- [ ] Direct browser-to-S3 uploads using presigned URLs
- [ ] File versioning
- [ ] Batch operations optimization
- [ ] Advanced metadata and tagging

---

**Need help?** Contact the development team or refer to the [AWS S3 Documentation](https://docs.aws.amazon.com/s3/).
