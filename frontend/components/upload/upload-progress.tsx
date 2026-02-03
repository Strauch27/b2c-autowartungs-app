/**
 * Upload Progress Component
 * Displays upload progress bar with percentage
 */

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  className,
  showPercentage = true,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            Uploading...
          </span>
        </div>
        {showPercentage && (
          <span className="text-sm text-gray-600">{progress}%</span>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
