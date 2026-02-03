/**
 * Workshop Photo Upload Component
 * Example integration of FileUploader for workshop photos
 */

'use client';

import React, { useState } from 'react';
import { FileUploader } from '@/components/upload';
import { UploadResult } from '@/lib/hooks/use-file-upload';
import { useToast } from '@/lib/hooks/use-toast';
import { ImagePreview } from '@/components/upload';

interface WorkshopPhotoUploadProps {
  workshopId: string;
  onPhotosUpdated?: (photoUrls: string[]) => void;
}

export const WorkshopPhotoUpload: React.FC<WorkshopPhotoUploadProps> = ({
  workshopId,
  onPhotosUpdated,
}) => {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadResult[]>([]);
  const { toast } = useToast();

  const handleUploadComplete = (result: UploadResult | UploadResult[]) => {
    const results = Array.isArray(result) ? result : [result];
    const newPhotos = [...uploadedPhotos, ...results];
    setUploadedPhotos(newPhotos);

    toast({
      title: 'Upload successful',
      description: `${results.length} photo(s) uploaded successfully`,
    });

    // Notify parent component
    onPhotosUpdated?.(newPhotos.map((p) => p.url));
  };

  const handleError = (error: Error) => {
    toast({
      variant: 'destructive',
      title: 'Upload failed',
      description: error.message,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Workshop Photos</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload photos of your workshop facilities. These photos help customers
          understand your service quality and professionalism.
        </p>
      </div>

      <FileUploader
        folder="workshops/photos"
        entityType="workshop"
        entityId={workshopId}
        description="Workshop facility photos"
        accept="image"
        multiple={true}
        maxFiles={10}
        onUploadComplete={handleUploadComplete}
        onError={handleError}
      />

      {uploadedPhotos.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">
            Uploaded Photos ({uploadedPhotos.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedPhotos.map((photo, index) => (
              <div key={photo.key} className="relative">
                <ImagePreview
                  src={photo.variants?.medium || photo.url}
                  alt={`Workshop photo ${index + 1}`}
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {Math.round(photo.size / 1024)} KB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
