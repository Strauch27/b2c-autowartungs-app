'use client';

import { useState, useRef } from 'react';
import { Trash2, Camera, Loader2, Play, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { bookingsApi } from '@/lib/api/bookings';
import { toast } from 'sonner';

const MAX_VIDEO_DURATION_SECONDS = 15;

interface ExtensionItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

interface ExtensionFormProps {
  orderId: string;
  customerName: string;
  onSubmit: (description: string, items: ExtensionItem[]) => void;
  onCancel: () => void;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = URL.createObjectURL(file);
  });
}

export function ExtensionForm({ orderId, customerName, onSubmit, onCancel }: ExtensionFormProps) {
  const t = useTranslations('workshopDashboard.detail');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ExtensionItem[]>([
    { id: '1', name: '', quantity: 1, unitPrice: '' },
  ]);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', quantity: 1, unitPrice: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ExtensionItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleMediaUpload = async (itemId: string, file: File) => {
    // Check video duration
    if (file.type.startsWith('video/')) {
      try {
        const duration = await getVideoDuration(file);
        if (duration > MAX_VIDEO_DURATION_SECONDS) {
          toast.error(t('videoTooLong'));
          return;
        }
      } catch {
        toast.error(t('uploadError'));
        return;
      }
    }

    setUploadingItemId(itemId);
    try {
      const result = await bookingsApi.uploadExtensionMedia(file);
      setItems(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, mediaUrl: result.url, mediaType: result.mediaType }
          : item
      ));
    } catch (error) {
      toast.error(t('uploadError'));
    } finally {
      setUploadingItemId(null);
    }
  };

  const removeMedia = (itemId: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, mediaUrl: undefined, mediaType: undefined }
        : item
    ));
  };

  const getItemTotal = (item: ExtensionItem) => {
    const price = parseFloat(item.unitPrice) || 0;
    return (price * item.quantity).toFixed(2);
  };

  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice) || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleSubmit = () => {
    onSubmit(description, items);
  };

  const MediaButton = ({ item }: { item: ExtensionItem }) => {
    const isUploading = uploadingItemId === item.id;

    if (item.mediaUrl) {
      return (
        <div className="relative inline-flex items-center gap-1">
          {item.mediaType === 'video' ? (
            <div className="h-8 w-8 rounded bg-neutral-100 flex items-center justify-center">
              <Play className="h-4 w-4 text-neutral-500" />
            </div>
          ) : (
            <img
              src={item.mediaUrl}
              alt=""
              className="h-8 w-8 rounded object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => removeMedia(item.id)}
            className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      );
    }

    return (
      <>
        <input
          ref={el => { fileInputRefs.current[item.id] = el; }}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleMediaUpload(item.id, file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRefs.current[item.id]?.click()}
          disabled={isUploading}
          className="rounded border border-neutral-200 p-1.5 text-neutral-400 transition-colors hover:border-cta hover:text-cta disabled:opacity-50"
          title={t('uploadMedia')}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </>
    );
  };

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4" data-testid="inline-extension-form">
      <p className="mb-3 text-sm font-semibold text-foreground">{t('newExtension').replace('+ ', '')}</p>

      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('notes')}</label>
        <textarea
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/30"
          rows={2}
          placeholder={t('extensionDescription')}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-muted-foreground">{t('extensionItems')}</label>

        {/* Desktop: table layout */}
        <table className="mt-1 hidden w-full text-sm sm:table">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="pb-1 text-left font-medium">{t('extensionItemPlaceholder').split(',')[0] || 'Name'}</th>
              <th className="w-16 pb-1 text-center font-medium">{t('extensionQuantity')}</th>
              <th className="w-24 pb-1 text-right font-medium">{t('extensionUnitPrice')}</th>
              <th className="w-24 pb-1 text-right font-medium">{t('extensionItemTotal')}</th>
              <th className="w-10 pb-1 text-center font-medium" />
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="py-1 pr-2">
                  <input
                    type="text"
                    className="w-full rounded border border-neutral-200 px-2 py-1.5 text-xs"
                    placeholder={t('extensionItemPlaceholder')}
                    value={item.name}
                    onChange={e => updateItem(item.id, 'name', e.target.value)}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded border border-neutral-200 px-2 py-1.5 text-center text-xs"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="text"
                    className="w-full rounded border border-neutral-200 px-2 py-1.5 text-right text-xs"
                    placeholder="0,00"
                    value={item.unitPrice}
                    onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                  />
                </td>
                <td className="py-1 pl-1 text-right text-xs font-medium text-muted-foreground">
                  {getItemTotal(item)} &euro;
                </td>
                <td className="py-1 text-center">
                  <MediaButton item={item} />
                </td>
                <td className="py-1 text-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-neutral-300 transition-colors hover:text-destructive"
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile: stacked card layout */}
        <div className="mt-2 space-y-3 sm:hidden">
          {items.map(item => (
            <div key={item.id} className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <input
                  type="text"
                  className="w-full rounded border border-neutral-200 px-3 py-2 text-sm min-h-[44px]"
                  placeholder={t('extensionItemPlaceholder')}
                  value={item.name}
                  onChange={e => updateItem(item.id, 'name', e.target.value)}
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-2 text-neutral-300 transition-colors hover:text-destructive"
                  disabled={items.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">{t('extensionQuantity')}</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded border border-neutral-200 px-2 py-2 text-center text-sm min-h-[44px]"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">{t('extensionUnitPrice')}</label>
                  <input
                    type="text"
                    className="w-full rounded border border-neutral-200 px-2 py-2 text-right text-sm min-h-[44px]"
                    placeholder="0,00"
                    value={item.unitPrice}
                    onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-muted-foreground">{t('extensionItemTotal')}</label>
                  <div className="flex flex-1 items-center justify-end text-sm font-medium text-muted-foreground">
                    {getItemTotal(item)} &euro;
                  </div>
                </div>
              </div>
              {/* Media upload row for mobile */}
              <div className="flex items-center gap-2 pt-1">
                <MediaButton item={item} />
                {!item.mediaUrl && (
                  <span className="text-[10px] text-muted-foreground">{t('uploadMedia')}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="link"
          size="sm"
          onClick={addItem}
          className="mt-2"
        >
          {t('addPosition')}
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-bold text-foreground">
          {t('extensionTotal')}: {total.toFixed(2)} &euro;
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            {t('cancelExtension')}
          </Button>
          <Button
            variant="workshop"
            size="sm"
            onClick={handleSubmit}
          >
            {t('sendExtension')}
          </Button>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground">
        {t('extensionNotice')}
      </p>
    </div>
  );
}
