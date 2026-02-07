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
import {
  Camera,
  Upload,
  Check,
  X,
  Pencil,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

interface HandoverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: {
    id: string;
    customer: string;
    vehicle: string;
    type: string;
  };
  onComplete: (data: { photos: string[]; customerSignature: string; notes: string }) => void;
}

const HandoverModal = ({
  open,
  onOpenChange,
  assignment,
  onComplete,
}: HandoverModalProps) => {
  const { language } = useLanguage();
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState({
    keysReceived: false,
    documentsPhotographed: false,
    conditionDocumented: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = {
    de: {
      title: "Fahrzeugübergabe dokumentieren",
      description: "Dokumentieren Sie die Übergabe für",
      photos: "Fahrzeugfotos",
      photosDesc: "Fotografieren Sie den Fahrzeugzustand",
      addPhoto: "Foto hinzufügen",
      takePhoto: "Kamera",
      signature: "Kundenunterschrift",
      signatureDesc: "Lassen Sie den Kunden unterschreiben",
      clearSignature: "Löschen",
      checklist: "Checkliste",
      keysReceived: "Fahrzeugschlüssel erhalten",
      documentsPhotographed: "Fahrzeugschein fotografiert",
      conditionDocumented: "Zustand dokumentiert",
      notes: "Anmerkungen",
      notesPlaceholder: "Besondere Hinweise oder Beschädigungen...",
      cancel: "Abbrechen",
      complete: "Übergabe abschließen",
      success: "Übergabe erfolgreich dokumentiert!",
    },
    en: {
      title: "Document Vehicle Handover",
      description: "Document the handover for",
      photos: "Vehicle Photos",
      photosDesc: "Photograph the vehicle condition",
      addPhoto: "Add Photo",
      takePhoto: "Camera",
      signature: "Customer Signature",
      signatureDesc: "Have the customer sign",
      clearSignature: "Clear",
      checklist: "Checklist",
      keysReceived: "Vehicle keys received",
      documentsPhotographed: "Registration documented",
      conditionDocumented: "Condition documented",
      notes: "Notes",
      notesPlaceholder: "Special notes or damages...",
      cancel: "Cancel",
      complete: "Complete Handover",
      success: "Handover documented successfully!",
    },
  };

  const texts = t[language];

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
    checklist.keysReceived &&
    checklist.documentsPhotographed &&
    checklist.conditionDocumented;

  const handleComplete = () => {
    if (isValid) {
      toast.success(texts.success);
      onComplete({
        photos,
        customerSignature: signature!,
        notes,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-jockey" />
            {texts.title}
          </DialogTitle>
          <DialogDescription>
            {texts.description} {assignment.customer} - {assignment.vehicle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {texts.photos}
            </Label>
            <p className="text-sm text-muted-foreground">{texts.photosDesc}</p>
            
            <div className="grid grid-cols-3 gap-2">
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
                <span className="text-xs">{texts.addPhoto}</span>
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
                aria-label={texts.takePhoto}
              >
                <Camera className="mr-2 h-4 w-4" />
                {texts.takePhoto}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                onClick={() => fileInputRef.current?.click()}
                aria-label={texts.addPhoto}
              >
                <Upload className="mr-2 h-4 w-4" />
                {texts.addPhoto}
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
                {texts.signature}
              </Label>
              {signature && (
                <Button variant="ghost" size="sm" onClick={clearSignature}>
                  <X className="mr-1 h-3 w-3" />
                  {texts.clearSignature}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{texts.signatureDesc}</p>
            
            <div className="rounded-lg border-2 border-border bg-card">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
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
                {language === "de" ? "Unterschrift erfasst" : "Signature captured"}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <Label>{texts.checklist}</Label>
            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="keys"
                  checked={checklist.keysReceived}
                  onCheckedChange={(c) =>
                    setChecklist({ ...checklist, keysReceived: !!c })
                  }
                />
                <Label htmlFor="keys" className="font-normal">
                  {texts.keysReceived}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="documents"
                  checked={checklist.documentsPhotographed}
                  onCheckedChange={(c) =>
                    setChecklist({ ...checklist, documentsPhotographed: !!c })
                  }
                />
                <Label htmlFor="documents" className="font-normal">
                  {texts.documentsPhotographed}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="condition"
                  checked={checklist.conditionDocumented}
                  onCheckedChange={(c) =>
                    setChecklist({ ...checklist, conditionDocumented: !!c })
                  }
                />
                <Label htmlFor="condition" className="font-normal">
                  {texts.conditionDocumented}
                </Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes">{texts.notes}</Label>
            <Textarea
              id="notes"
              placeholder={texts.notesPlaceholder}
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
                {language === "de"
                  ? "Bitte fügen Sie mindestens ein Foto hinzu, erfassen Sie die Unterschrift und vervollständigen Sie die Checkliste."
                  : "Please add at least one photo, capture the signature, and complete the checklist."}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={() => onOpenChange(false)}
              aria-label={texts.cancel}
            >
              {texts.cancel}
            </Button>
            <Button
              variant="jockey"
              className="flex-1 min-h-[44px]"
              onClick={handleComplete}
              disabled={!isValid}
              aria-label={texts.complete}
            >
              <Check className="mr-2 h-4 w-4" />
              {texts.complete}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HandoverModal;
