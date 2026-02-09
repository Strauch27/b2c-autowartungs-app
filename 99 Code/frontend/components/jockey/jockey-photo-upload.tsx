/**
 * Jockey Photo Upload Component
 * Example integration of FileUploader for jockey profile photos
 */

'use client';

import React, { useState } from 'react';
import { FileUploader } from '@/components/upload';
import { UploadResult } from '@/lib/hooks/use-file-upload';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';

const translations = {
  de: {
    title: 'Profilfoto',
    description: 'Laden Sie ein professionelles Foto für Ihr Fahrerprofil hoch. Dieses wird für Kunden bei der Buchung sichtbar sein.',
    uploadSuccess: (count: number) => `${count} Foto(s) erfolgreich hochgeladen`,
    uploadFailed: (msg: string) => `Upload fehlgeschlagen: ${msg}`,
    successMessage: 'Foto erfolgreich hochgeladen! Ihr Profil wurde aktualisiert.',
    altText: 'Hochgeladenes Profilfoto',
  },
  en: {
    title: 'Profile Photo',
    description: 'Upload a professional photo for your jockey profile. This will be visible to customers when they book services.',
    uploadSuccess: (count: number) => `${count} photo(s) uploaded successfully`,
    uploadFailed: (msg: string) => `Upload failed: ${msg}`,
    successMessage: 'Photo uploaded successfully! Your profile has been updated.',
    altText: 'Uploaded profile photo',
  },
} as const;

interface JockeyPhotoUploadProps {
  jockeyId: string;
  onUploadSuccess?: (photoUrl: string) => void;
}

export const JockeyPhotoUpload: React.FC<JockeyPhotoUploadProps> = ({
  jockeyId,
  onUploadSuccess,
}) => {
  const locale = useLocale() as 'de' | 'en';
  const t = translations[locale] || translations.de;
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadResult[]>([]);

  const handleUploadComplete = (result: UploadResult | UploadResult[]) => {
    const results = Array.isArray(result) ? result : [result];
    setUploadedPhotos((prev) => [...prev, ...results]);

    toast.success(t.uploadSuccess(results.length));

    // Call callback with the first photo URL
    if (results.length > 0) {
      onUploadSuccess?.(results[0].url);
    }
  };

  const handleError = (error: Error) => {
    toast.error(t.uploadFailed(error.message));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t.title}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {t.description}
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
            {t.successMessage}
          </p>
          <div className="mt-2">
            <img
              src={uploadedPhotos[0].variants?.thumbnail || uploadedPhotos[0].url}
              alt={t.altText}
              className="h-20 w-20 rounded-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};
