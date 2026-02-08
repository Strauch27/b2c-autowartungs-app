'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ExtensionItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
}

interface ExtensionFormProps {
  orderId: string;
  customerName: string;
  onSubmit: (description: string, items: ExtensionItem[]) => void;
  onCancel: () => void;
}

export function ExtensionForm({ orderId, customerName, onSubmit, onCancel }: ExtensionFormProps) {
  const t = useTranslations('workshopDashboard.detail');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ExtensionItem[]>([
    { id: '1', name: '', quantity: 1, unitPrice: '' },
  ]);

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
        <table className="mt-1 w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="pb-1 text-left font-medium">{t('extensionItemPlaceholder').split(',')[0] || 'Name'}</th>
              <th className="w-16 pb-1 text-center font-medium">{t('extensionQuantity')}</th>
              <th className="w-24 pb-1 text-right font-medium">{t('extensionUnitPrice')}</th>
              <th className="w-24 pb-1 text-right font-medium">{t('extensionItemTotal')}</th>
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
        <button
          onClick={addItem}
          className="mt-2 text-xs font-medium text-primary hover:underline"
        >
          {t('addPosition')}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm font-bold text-foreground">
          {t('extensionTotal')}: {total.toFixed(2)} &euro;
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {t('cancelExtension')}
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-cta px-4 py-2 text-xs font-semibold text-cta-foreground transition-colors hover:bg-cta-hover"
          >
            {t('sendExtension')}
          </button>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground">
        {t('extensionNotice')}
      </p>
    </div>
  );
}
