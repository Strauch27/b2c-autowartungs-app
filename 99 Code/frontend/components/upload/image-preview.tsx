/**
 * Image Preview Component
 * Displays image thumbnails with loading states
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  onRemove?: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt,
  className,
  onRemove,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn('relative aspect-square bg-gray-100 rounded-lg overflow-hidden', className)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-xs text-gray-500 text-center">Failed to load image</p>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
};
