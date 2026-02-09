/**
 * Workshop Photo Upload Component
 * Example integration of FileUploader for workshop photos
 */

'use client';

import React, { useState } from 'react';
import { FileUploader } from '@/components/upload';
import { UploadResult } from '@/lib/hooks/use-file-upload';
import { toast } from 'sonner';
import { ImagePreview } from '@/components/upload';
import { useLocale } from 'next-intl';

const translations = {
  de: {
    title: 'Werkstatt-Fotos',
    description: 'Laden Sie Fotos Ihrer Werkstatt hoch. Diese Fotos helfen Kunden, Ihre Servicequalität und Professionalität einzuschätzen.',
    uploadSuccess: (count: number) => `${count} Foto(s) erfolgreich hochgeladen`,
    uploadFailed: (msg: string) => `Upload fehlgeschlagen: ${msg}`,
    uploadedPhotos: (count: number) => `Hochgeladene Fotos (${count})`,
    altText: (index: number) => `Werkstatt-Foto ${index}`,
  },
  en: {
    title: 'Workshop Photos',
    description: 'Upload photos of your workshop facilities. These photos help customers understand your service quality and professionalism.',
    uploadSuccess: (count: number) => `${count} photo(s) uploaded successfully`,
    uploadFailed: (msg: string) => `Upload failed: ${msg}`,
    uploadedPhotos: (count: number) => `Uploaded Photos (${count})`,
    altText: (index: number) => `Workshop photo ${index}`,
  },
} as const;

interface WorkshopPhotoUploadProps {
  workshopId: string;
  onPhotosUpdated?: (photoUrls: string[]) => void;
}

export const WorkshopPhotoUpload: React.FC<WorkshopPhotoUploadProps> = ({
  workshopId,
  onPhotosUpdated,
}) => {
  const locale = useLocale() as 'de' | 'en';
  const t = translations[locale] || translations.de;
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadResult[]>([]);

  const handleUploadComplete = (result: UploadResult | UploadResult[]) => {
    const results = Array.isArray(result) ? result : [result];
    const newPhotos = [...uploadedPhotos, ...results];
    setUploadedPhotos(newPhotos);

    toast.success(t.uploadSuccess(results.length));

    // Notify parent component
    onPhotosUpdated?.(newPhotos.map((p) => p.url));
  };

  const handleError = (error: Error) => {
    toast.error(t.uploadFailed(error.message));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t.title}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {t.description}
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
            {t.uploadedPhotos(uploadedPhotos.length)}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedPhotos.map((photo, index) => (
              <div key={photo.key} className="relative">
                <ImagePreview
                  src={photo.variants?.medium || photo.url}
                  alt={t.altText(index + 1)}
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
