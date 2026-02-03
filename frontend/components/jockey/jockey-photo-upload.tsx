/**
 * Jockey Photo Upload Component
 * Example integration of FileUploader for jockey profile photos
 */

'use client';

import React, { useState } from 'react';
import { FileUploader } from '@/components/upload';
import { UploadResult } from '@/lib/hooks/use-file-upload';
import { useToast } from '@/lib/hooks/use-toast';

interface JockeyPhotoUploadProps {
  jockeyId: string;
  onUploadSuccess?: (photoUrl: string) => void;
}

export const JockeyPhotoUpload: React.FC<JockeyPhotoUploadProps> = ({
  jockeyId,
  onUploadSuccess,
}) => {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadResult[]>([]);
  const { toast } = useToast();

  const handleUploadComplete = (result: UploadResult | UploadResult[]) => {
    const results = Array.isArray(result) ? result : [result];
    setUploadedPhotos((prev) => [...prev, ...results]);

    toast({
      title: 'Upload successful',
      description: `${results.length} photo(s) uploaded successfully`,
    });

    // Call callback with the first photo URL
    if (results.length > 0) {
      onUploadSuccess?.(results[0].url);
    }
  };

  const handleError = (error: Error) => {
    toast({
      variant: 'destructive',
      title: 'Upload failed',
      description: error.message,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Profile Photo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a professional photo for your jockey profile. This will be
          visible to customers when they book services.
        </p>
      </div>

      <FileUploader
        folder="jockeys/photos"
        entityType="jockey"
        entityId={jockeyId}
        description="Jockey profile photo"
        accept="image"
        multiple={false}
        onUploadComplete={handleUploadComplete}
        onError={handleError}
      />

      {uploadedPhotos.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            Photo uploaded successfully! Your profile has been updated.
          </p>
          <div className="mt-2">
            <img
              src={uploadedPhotos[0].variants?.thumbnail || uploadedPhotos[0].url}
              alt="Uploaded profile photo"
              className="h-20 w-20 rounded-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};
