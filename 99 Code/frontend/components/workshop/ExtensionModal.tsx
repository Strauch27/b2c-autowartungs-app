import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Send,
  Euro,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ExtensionItem {
  id: string;
  description: string;
  price: string;
}

interface ExtensionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  customerName: string;
  onSubmit: (items: ExtensionItem[], photos: string[]) => void;
}

// TODO: W13 Security - Backend must verify ownership before accepting extension creation.
// The workshop creating the extension must be the same workshop assigned to the booking.
// Implement server-side ownership check in POST /api/workshops/orders/:id/extensions
// to prevent unauthorized extensions on bookings belonging to other workshops.
const ExtensionModal = ({
  open,
  onOpenChange,
  orderId,
  customerName,
  onSubmit,
}: ExtensionModalProps) => {
  const t = useTranslations('workshopModal.extension');
  const [items, setItems] = useState<ExtensionItem[]>([
    { id: "1", description: "", price: "" },
  ]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, { description?: boolean; price?: boolean }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", price: "" },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: "description" | "price", value: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPrice = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    return sum + price;
  }, 0);

  const isValid = items.every((item) => item.description.trim() && parseFloat(item.price) > 0);

  const handleSubmit = () => {
    // Build per-item validation errors
    const errors: Record<string, { description?: boolean; price?: boolean }> = {};
    let hasError = false;
    items.forEach((item) => {
      const itemErrors: { description?: boolean; price?: boolean } = {};
      if (!item.description.trim()) {
        itemErrors.description = true;
        hasError = true;
      }
      if (!item.price || parseFloat(item.price) <= 0) {
        itemErrors.price = true;
        hasError = true;
      }
      if (itemErrors.description || itemErrors.price) {
        errors[item.id] = itemErrors;
      }
    });
    setValidationErrors(errors);

    if (hasError) {
      toast.error(t('validation'));
      return;
    }
    onSubmit(items, photos);
    toast.success(t('success'));
    onOpenChange(false);
    // Reset form
    setItems([{ id: "1", description: "", price: "" }]);
    setPhotos([]);
    setValidationErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-workshop" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')} {orderId} - {customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('item')} {index + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('itemDescription')}</Label>
                  <Textarea
                    placeholder={t('itemDescriptionPlaceholder')}
                    value={item.description}
                    onChange={(e) => {
                      updateItem(item.id, "description", e.target.value);
                      if (validationErrors[item.id]?.description) {
                        setValidationErrors((prev) => {
                          const next = { ...prev };
                          if (next[item.id]) next[item.id] = { ...next[item.id], description: false };
                          return next;
                        });
                      }
                    }}
                    rows={2}
                    className={validationErrors[item.id]?.description ? "border-destructive" : ""}
                  />
                  {validationErrors[item.id]?.description && (
                    <p className="text-xs text-destructive">{t('descriptionRequired')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('itemPrice')}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={item.price}
                      onChange={(e) => {
                        updateItem(item.id, "price", e.target.value);
                        if (validationErrors[item.id]?.price) {
                          setValidationErrors((prev) => {
                            const next = { ...prev };
                            if (next[item.id]) next[item.id] = { ...next[item.id], price: false };
                            return next;
                          });
                        }
                      }}
                      className={`pr-8 ${validationErrors[item.id]?.price ? "border-destructive" : ""}`}
                    />
                    <Euro className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {validationErrors[item.id]?.price && (
                    <p className="text-xs text-destructive">{t('priceRequired')}</p>
                  )}
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('addItem')}
            </Button>
          </div>

          {/* Photo Upload */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t('photos')}
            </Label>
            <p className="text-sm text-muted-foreground">{t('photosDesc')}</p>

            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Evidence ${index + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-workshop hover:text-workshop"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">{t('addPhoto')}</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Total */}
          <div className="rounded-lg bg-workshop/10 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('total')}</span>
              <span className="text-2xl font-bold text-workshop">{totalPrice.toFixed(2)}€</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="workshop"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!isValid}
            >
              <Send className="mr-2 h-4 w-4" />
              {t('send')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionModal;
