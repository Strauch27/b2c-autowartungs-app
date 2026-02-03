# Upload Components

React components for file upload functionality with drag & drop, progress tracking, and image previews.

## Components

### FileUploader

Main component for uploading files with drag & drop support.

**Features**:
- Drag & drop interface
- File type validation
- File size validation
- Multiple file support
- Progress tracking
- Image previews
- Error handling

**Props**:
```typescript
interface FileUploaderProps {
  folder: string;              // Required: S3 folder path
  entityType?: string;         // Optional: Entity type (e.g., "jockey")
  entityId?: string;           // Optional: Entity ID
  description?: string;        // Optional: File description
  accept?: 'image' | 'video' | 'all'; // File type filter
  multiple?: boolean;          // Allow multiple files
  maxFiles?: number;           // Maximum number of files (default: 10)
  onUploadComplete?: (results: UploadResult | UploadResult[]) => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

**Example**:
```tsx
import { FileUploader } from '@/components/upload';

function MyComponent() {
  return (
    <FileUploader
      folder="jockeys/photos"
      entityType="jockey"
      entityId="jockey-123"
      accept="image"
      multiple={false}
      onUploadComplete={(result) => {
        console.log('Uploaded:', result);
      }}
      onError={(error) => {
        console.error('Upload failed:', error);
      }}
    />
  );
}
```

---

### ImagePreview

Component for displaying image thumbnails with loading states.

**Props**:
```typescript
interface ImagePreviewProps {
  src: string;          // Image URL
  alt: string;          // Alt text
  className?: string;   // Additional classes
  onRemove?: () => void; // Optional remove callback
}
```

**Example**:
```tsx
import { ImagePreview } from '@/components/upload';

function Gallery() {
  return (
    <ImagePreview
      src="https://example.com/image.jpg"
      alt="Photo"
    />
  );
}
```

---

### UploadProgress

Component for displaying upload progress with a progress bar.

**Props**:
```typescript
interface UploadProgressProps {
  progress: number;        // Progress percentage (0-100)
  className?: string;      // Additional classes
  showPercentage?: boolean; // Show percentage text (default: true)
}
```

**Example**:
```tsx
import { UploadProgress } from '@/components/upload';

function UploadingFile() {
  const [progress, setProgress] = useState(0);

  return (
    <UploadProgress
      progress={progress}
      showPercentage={true}
    />
  );
}
```

---

## Hooks

### useFileUpload

React hook for handling file uploads with progress tracking.

**Returns**:
```typescript
{
  uploadFile: (file: File, options: UploadOptions) => Promise<UploadResult | null>;
  uploadMultiple: (files: File[], options: UploadOptions) => Promise<UploadResult[] | null>;
  deleteFile: (key: string) => Promise<boolean>;
  uploading: boolean;
  progress: UploadProgress;
  error: Error | null;
}
```

**Example**:
```tsx
import { useFileUpload } from '@/lib/hooks/use-file-upload';

function MyComponent() {
  const { uploadFile, uploading, progress, error } = useFileUpload();

  const handleUpload = async (file: File) => {
    const result = await uploadFile(file, {
      folder: 'workshops/photos',
      onProgress: (prog) => {
        console.log(`${prog.percentage}%`);
      },
      onSuccess: (res) => {
        console.log('Done:', res);
      },
      onError: (err) => {
        console.error('Error:', err);
      },
    });
  };

  return (
    <div>
      {uploading && <p>Progress: {progress.percentage}%</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

---

## Example Integrations

### Jockey Photo Upload

```tsx
import { JockeyPhotoUpload } from '@/components/jockey/jockey-photo-upload';

function JockeyProfile() {
  return (
    <JockeyPhotoUpload
      jockeyId="jockey-123"
      onUploadSuccess={(photoUrl) => {
        // Update jockey profile with new photo URL
      }}
    />
  );
}
```

### Workshop Photo Upload

```tsx
import { WorkshopPhotoUpload } from '@/components/workshop/workshop-photo-upload';

function WorkshopProfile() {
  return (
    <WorkshopPhotoUpload
      workshopId="workshop-456"
      onPhotosUpdated={(photoUrls) => {
        // Update workshop with new photo URLs
      }}
    />
  );
}
```

---

## File Type Support

### Images
- JPEG/JPG
- PNG
- WebP
- Max size: 10MB

### Videos
- MP4
- MOV (QuickTime)
- M4V
- Max size: 50MB

---

## Upload Folders

Available folders for organizing uploads:

- `jockeys/photos` - Jockey profile photos
- `jockeys/documents` - Jockey documents
- `workshops/photos` - Workshop facility photos
- `workshops/documents` - Workshop documents
- `vehicles/photos` - Vehicle photos
- `maintenance/photos` - Maintenance photos
- `maintenance/videos` - Maintenance videos
- `temp` - Temporary files

---

## Error Handling

The components automatically handle common errors:

- **Invalid file type**: Shows error if file type is not allowed
- **File too large**: Shows error if file exceeds size limit
- **Upload failed**: Shows error if network request fails
- **Too many files**: Shows error if more than maxFiles are selected

**Custom error handling**:
```tsx
<FileUploader
  folder="jockeys/photos"
  onError={(error) => {
    // Custom error handling
    if (error.message.includes('file type')) {
      toast.error('Please upload JPEG or PNG images only');
    } else if (error.message.includes('size')) {
      toast.error('File is too large. Max 10MB allowed');
    } else {
      toast.error('Upload failed. Please try again');
    }
  }}
/>
```

---

## Image Variants

When uploading images, the service automatically generates variants:

- **Thumbnail**: 200x200px (square, cover fit)
- **Medium**: 800x800px (inside fit)
- **Large**: 1920x1920px max (optimized original)

**Using variants**:
```tsx
const result = await uploadFile(file, { folder: 'jockeys/photos' });

// Access variants
const thumbnailUrl = result.variants?.thumbnail; // For profile avatars
const mediumUrl = result.variants?.medium;       // For gallery thumbnails
const fullUrl = result.url;                      // For full-size viewing
```

---

## Styling

All components use Tailwind CSS and can be customized with the `className` prop:

```tsx
<FileUploader
  folder="jockeys/photos"
  className="max-w-2xl mx-auto"
/>
```

---

## Best Practices

1. **Validate on client**: Check file types and sizes before uploading
2. **Use variants**: Use thumbnail/medium for better performance
3. **Show progress**: Always show upload progress for better UX
4. **Handle errors**: Provide clear error messages to users
5. **Clean up**: Delete unused files from S3
6. **Optimize images**: Images are automatically optimized server-side

---

## Troubleshooting

### Uploads fail immediately

- Check if `NEXT_PUBLIC_API_URL` is set in `.env.local`
- Verify authentication token is present
- Check browser console for errors

### Images not loading

- Verify S3 bucket is configured correctly
- Check if image URLs are accessible
- Ensure CORS is enabled on S3 bucket

### Progress not updating

- Progress updates only work with XMLHttpRequest
- Ensure you're using the provided hook
- Check network tab for upload progress

---

## Dependencies

- `lucide-react` - Icons
- `next/image` - Optimized image component
- Built-in browser APIs (XMLHttpRequest, FileReader)

---

## Future Enhancements

- [ ] Webcam capture support
- [ ] Image cropping before upload
- [ ] Video preview support
- [ ] Retry failed uploads
- [ ] Pause/resume uploads
- [ ] Bulk delete functionality
