'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface SignaturePadProps {
  onSignatureChange?: (dataUrl: string | null) => void;
  onClear?: () => void;
}

export function SignaturePad({ onSignatureChange, onClear }: SignaturePadProps) {
  const t = useTranslations('jockeyDashboard.detail');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHasSignature(true);
    const canvas = canvasRef.current;
    if (canvas) {
      onSignatureChange?.(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasSignature(false);
    onSignatureChange?.(null);
    onClear?.();
  };

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200"
      data-testid="signature-pad"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
          {t('customerSignature')}
        </p>
        {hasSignature && (
          <button
            onClick={clearSignature}
            className="text-[10px] text-destructive hover:underline font-medium min-h-[44px] flex items-center"
            data-testid="clear-signature"
          >
            {t('clearSignature')}
          </button>
        )}
      </div>
      <div className="sig-area-lined h-28 rounded-xl border-2 border-neutral-200 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={340}
          height={112}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <p className="absolute text-xs text-neutral-300 font-medium pointer-events-none">
            {t('signHere')}
          </p>
        )}
      </div>
    </div>
  );
}
