'use client';

import { useRef } from 'react';
import { Plus, X, Camera, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PhotoDocGridProps {
  photos: string[];
  onCapture: (dataUrl: string) => void;
  onRemove: (index: number) => void;
  maxPhotos?: number;
}

export function PhotoDocGrid({ photos, onCapture, onRemove, maxPhotos = 4 }: PhotoDocGridProps) {
  const t = useTranslations('jockeyDashboard.detail');
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onCapture(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    e.target.value = '';
  };

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200"
      data-testid="photo-doc-grid"
    >
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
        {t('photoDocumentation')}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: maxPhotos }).map((_, idx) => {
          const photo = photos[idx];
          if (photo) {
            return (
              <div key={idx} className="relative aspect-square">
                <img
                  src={photo}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute top-1 right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <button
                  onClick={() => onRemove(idx)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white"
                  aria-label="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          }
          return (
            <button
              key={idx}
              onClick={() => fileRef.current?.click()}
              className="aspect-square bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              data-testid={`photo-slot-${idx}`}
            >
              <Plus className="w-6 h-6 text-neutral-300" />
            </button>
          );
        })}
      </div>
      <button
        onClick={() => cameraRef.current?.click()}
        className="mt-3 w-full py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-500 hover:bg-neutral-100 flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
        data-testid="open-camera-btn"
      >
        <Camera className="w-4 h-4" />
        {t('openCamera')}
      </button>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
