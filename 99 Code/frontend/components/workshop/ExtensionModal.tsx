import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ExtensionForm } from "./ExtensionForm";

interface ExtensionItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

interface ExtensionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  customerName: string;
  onSubmit: (description: string, items: ExtensionItem[]) => void;
}

const ExtensionModal = ({
  open,
  onOpenChange,
  orderId,
  customerName,
  onSubmit,
}: ExtensionModalProps) => {
  const t = useTranslations('workshopModal.extension');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-workshop" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')} {orderId} - {customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="px-2 pb-4">
          <ExtensionForm
            orderId={orderId}
            customerName={customerName}
            onSubmit={(description, items) => {
              onSubmit(description, items);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionModal;
