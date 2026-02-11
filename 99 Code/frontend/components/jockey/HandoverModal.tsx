import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Upload,
  Check,
  X,
  Pencil,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface HandoverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: {
    id: string;
    customer: string;
    vehicle: string;
    type: string;
  };
  onComplete: (data: { photos: string[]; customerSignature: string; notes: string; mileage: number }) => void;
}

const HandoverModal = ({
  open,
  onOpenChange,
  assignment,
  onComplete,
}: HandoverModalProps) => {
  const t = useTranslations('handoverModal');
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [notes, setNotes] = useState("");
  const [mileage, setMileage] = useState("");
  const [checklist, setChecklist] = useState({
    keysReceived: false,
    documentsPhotographed: false,
    conditionDocumented: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignature(null);
  };

  const isValid =
    photos.length > 0 &&
    signature &&
    mileage && parseInt(mileage) > 0 &&
    checklist.keysReceived &&
    checklist.documentsPhotographed &&
    checklist.conditionDocumented;

  const handleComplete = () => {
    if (isValid) {
      toast.success(t('success'));
      onComplete({
        photos,
        customerSignature: signature!,
        notes,
        mileage: parseInt(mileage),
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[100dvh] h-[100dvh] overflow-y-auto sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-none sm:rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-jockey" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')} {assignment.customer} - {assignment.vehicle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t('photos')}
            </Label>
            <p className="text-sm text-muted-foreground">{t('photosDesc')}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Vehicle ${index + 1}`}
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
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs">{t('addPhoto')}</span>
              </button>
            </div>
            {/* J8: Camera capture button */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                onClick={() => cameraInputRef.current?.click()}
                aria-label={t('takePhoto')}
              >
                <Camera className="mr-2 h-4 w-4" />
                {t('takePhoto')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                onClick={() => fileInputRef.current?.click()}
                aria-label={t('addPhoto')}
              >
                <Upload className="mr-2 h-4 w-4" />
                {t('addPhoto')}
              </Button>
            </div>
            {/* TODO: Photos are currently held in local state only. Implement backend upload when endpoint is available. */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Signature Pad */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                {t('signature')}
              </Label>
              {signature && (
                <Button variant="ghost" size="sm" onClick={clearSignature}>
                  <X className="mr-1 h-3 w-3" />
                  {t('clearSignature')}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{t('signatureDesc')}</p>
            
            <div className="rounded-lg border-2 border-border bg-card">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            {signature && (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                {t('signatureCaptured')}
              </div>
            )}
          </div>

          {/* Mileage */}
          <div className="space-y-3">
            <Label htmlFor="mileage" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              {t('mileage')} <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">{t('mileageDesc')}</p>
            <div className="relative">
              <Input
                id="mileage"
                type="number"
                placeholder={t('mileagePlaceholder')}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                min="0"
                max="999999"
                className={!mileage ? 'border-amber-300' : ''}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <Label>{t('checklist')}</Label>
            <div className="space-y-1 rounded-lg border border-border p-3">
              <div className="flex items-center space-x-3 min-h-[44px]">
                <Checkbox
                  id="keys"
                  checked={checklist.keysReceived}
                  onCheckedChange={(c) =>
                    setChecklist({ ...checklist, keysReceived: !!c })
                  }
                  className="h-5 w-5"
                />
                <Label htmlFor="keys" className="font-normal text-sm">
                  {t('keysReceived')}
                </Label>
              </div>
              <div className="flex items-center space-x-3 min-h-[44px]">
                <Checkbox
                  id="documents"
                  checked={checklist.documentsPhotographed}
                  onCheckedChange={(c) =>
                    setChecklist({ ...checklist, documentsPhotographed: !!c })
                  }
                  className="h-5 w-5"
                />
                <Label htmlFor="documents" className="font-normal text-sm">
                  {t('documentsPhotographed')}
                </Label>
              </div>
              <div className="flex items-center space-x-3 min-h-[44px]">
                <Checkbox
                  id="condition"
                  checked={checklist.conditionDocumented}
                  onCheckedChange={(c) =>
                    setChecklist({ ...checklist, conditionDocumented: !!c })
                  }
                  className="h-5 w-5"
                />
                <Label htmlFor="condition" className="font-normal text-sm">
                  {t('conditionDocumented')}
                </Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes">{t('notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Validation Warning */}
          {!isValid && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {t('validationWarning')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              className="w-full sm:flex-1 min-h-[48px]"
              onClick={() => onOpenChange(false)}
              aria-label={t('cancel')}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="jockey"
              className="w-full sm:flex-1 min-h-[48px]"
              onClick={handleComplete}
              disabled={!isValid}
              aria-label={t('complete')}
            >
              <Check className="mr-2 h-4 w-4" />
              {t('complete')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HandoverModal;
