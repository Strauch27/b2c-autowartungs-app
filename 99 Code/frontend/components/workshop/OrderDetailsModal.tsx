import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  CheckCircle,
  Circle,
  ArrowRight,
  X,
  Camera,
  Upload,
  Download,
  Loader2,
  History,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { apiClient } from "@/lib/api/client";

interface Order {
  id: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  vehiclePlate: string;
  vehicleId?: string;
  service: string;
  status: "pending" | "inProgress" | "completed" | "cancelled";
  backendStatus?: string; // Original backend BookingStatus for FSM transitions
  date: string;
  pickupAddress: string;
  notes?: string;
}

interface VehicleHistoryEntry {
  id: string;
  serviceType: string;
  status: string;
  pickupDate: string;
}

interface ExtensionStatus {
  id: string;
  status: string;
  description: string;
}

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onStatusChange: (orderId: string, newStatus: "pending" | "inProgress" | "completed" | "cancelled", currentBackendStatus?: string) => void;
}

const OrderDetailsModal = ({
  open,
  onOpenChange,
  order,
  onStatusChange,
}: OrderDetailsModalProps) => {
  const t = useTranslations('workshopModal.orderDetails');
  const language = useLocale();

  // W4: Photo upload state
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // W8: Vehicle history state
  const [vehicleHistory, setVehicleHistory] = useState<VehicleHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // W7: Extension polling state
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus | null>(null);
  const [extensionPolling, setExtensionPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // W8: Fetch vehicle history
  useEffect(() => {
    if (!open || !order.vehicleId) return;
    let cancelled = false;

    async function fetchHistory() {
      setHistoryLoading(true);
      try {
        const response = await apiClient.get<{ success: boolean; data: VehicleHistoryEntry[] }>(
          `/api/vehicles/${order.vehicleId}/bookings`
        );
        if (!cancelled) {
          setVehicleHistory(response.data || []);
        }
      } catch {
        // API may not exist yet - use empty array as fallback
        if (!cancelled) {
          setVehicleHistory([]);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    fetchHistory();
    return () => { cancelled = true; };
  }, [open, order.vehicleId]);

  // W7: Extension status polling
  useEffect(() => {
    if (!open || order.status !== "inProgress") {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setExtensionPolling(false);
      return;
    }

    async function pollExtension() {
      try {
        const response = await apiClient.get<{ success: boolean; data: ExtensionStatus[] }>(
          `/api/workshops/orders/${order.id}/extensions`
        );
        const extensions = response.data || [];
        const pending = extensions.find(e => e.status === 'PENDING_APPROVAL');
        if (pending) {
          setExtensionStatus(pending);
          setExtensionPolling(true);
        } else {
          setExtensionStatus(extensions[0] || null);
          setExtensionPolling(false);
          // Stop polling if no pending extension
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      } catch {
        // API may not exist yet - silently ignore
      }
    }

    pollExtension();
    pollingRef.current = setInterval(pollExtension, 10000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [open, order.id, order.status]);

  // W4: Handle photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setPhotos((prev) => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // W11: Invoice export
  const handleExportInvoice = useCallback(() => {
    const invoiceData = {
      orderId: order.id,
      customer: order.customer,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      vehicle: order.vehicle,
      vehiclePlate: order.vehiclePlate,
      service: order.service,
      date: order.date,
      pickupAddress: order.pickupAddress,
      status: order.status,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [order]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setPhotos([]);
      setVehicleHistory([]);
      setExtensionStatus(null);
      setExtensionPolling(false);
    }
  }, [open]);

  const statusConfig = {
    pending: {
      label: t('status.pending'),
      class: "badge-pending",
    },
    inProgress: {
      label: t('status.inProgress'),
      class: "badge-in-progress",
    },
    completed: {
      label: t('status.completed'),
      class: "badge-completed",
    },
    cancelled: {
      label: t('status.cancelled'),
      class: "badge-destructive",
    },
  };

  const timelineSteps = [
    { key: "received", label: t('steps.received'), completed: true },
    { key: "inProgress", label: t('steps.inProgress'), completed: order.status === "inProgress" || order.status === "completed" },
    { key: "completed", label: t('steps.completed'), completed: order.status === "completed" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {order.id}
            </DialogTitle>
            <Badge data-testid="booking-status" className={statusConfig[order.status].class}>
              {statusConfig[order.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info - W12: Contact links */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <User className="h-4 w-4 text-primary" />
              {t('customer')}
            </h3>
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <p className="font-medium">{order.customer}</p>
              {order.customerEmail ? (
                <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Mail className="h-4 w-4" />
                  {order.customerEmail}
                </a>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {t('contactNotAvailable')}
                </div>
              )}
              {order.customerPhone ? (
                <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Phone className="h-4 w-4" />
                  {order.customerPhone}
                </a>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {t('contactNotAvailable')}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <Car className="h-4 w-4 text-primary" />
              {t('vehicle')}
            </h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="font-medium">{order.vehicle}</p>
              <p className="text-sm text-muted-foreground">{order.vehiclePlate}</p>
            </div>
          </div>

          {/* Service */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <Wrench className="h-4 w-4 text-primary" />
              {t('service')}
            </h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="font-medium">{order.service}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {order.date}
                </span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              {t('address')}
            </h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm">{order.pickupAddress}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-primary" />
              {t('timeline')}
            </h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="relative">
                {timelineSteps.map((step, index) => (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      {index < timelineSteps.length - 1 && (
                        <div className={`w-0.5 h-8 ${step.completed ? "bg-success" : "bg-muted"}`} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* W7: Extension Status Polling Indicator */}
          {extensionPolling && extensionStatus && (
            <div className="flex items-center gap-3 rounded-lg border border-cta/30 bg-cta/5 p-4">
              <Loader2 className="h-5 w-5 animate-spin text-cta" />
              <div>
                <p className="text-sm font-medium text-cta">{t('extensionPending')}</p>
                <p className="text-xs text-muted-foreground">{extensionStatus.description}</p>
              </div>
            </div>
          )}

          {extensionStatus && extensionStatus.status === 'APPROVED' && (
            <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
              <CheckCircle className="h-5 w-5 text-success" />
              <p className="text-sm font-medium text-success">{t('extensionApproved')}</p>
            </div>
          )}

          {extensionStatus && extensionStatus.status === 'DECLINED' && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <X className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">{t('extensionDeclined')}</p>
            </div>
          )}

          {/* W4: Photo Upload for Damage Documentation */}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <Camera className="h-4 w-4 text-primary" />
                {t('photos')}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={photo}
                      alt={`${t('photoPreview')} ${index + 1}`}
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
                  <span className="text-xs">{t('addPhotos')}</span>
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
          )}

          {/* Notes */}
          {order.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold">{t('notes')}</h3>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{order.notes || t('noNotes')}</p>
              </div>
            </div>
          )}

          {/* W8: Vehicle History */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <History className="h-4 w-4 text-primary" />
              {t('vehicleHistory')}
            </h3>
            <div className="rounded-lg border border-border bg-card p-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : vehicleHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noHistory')}</p>
              ) : (
                <div className="space-y-2">
                  {vehicleHistory.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{entry.serviceType}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.pickupDate).toLocaleDateString(language === "de" ? "de-DE" : "en-US")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entry.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions - FSM-aware transitions */}
          {/* FSM Flow: PICKED_UP -> AT_WORKSHOP -> IN_SERVICE -> READY_FOR_RETURN */}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <div className="flex gap-3">
              {/* If vehicle is picked up (en route), allow marking as arrived */}
              {order.backendStatus === "PICKED_UP" && (
                <Button
                  data-testid="booking-accept"
                  variant="workshop"
                  className="flex-1"
                  onClick={() => onStatusChange(order.id, "inProgress", order.backendStatus)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('markAsArrived')}
                </Button>
              )}
              {/* If vehicle is at workshop, allow starting work */}
              {order.backendStatus === "AT_WORKSHOP" && (
                <Button
                  data-testid="booking-accept"
                  variant="workshop"
                  className="flex-1"
                  onClick={() => onStatusChange(order.id, "inProgress", order.backendStatus)}
                >
                  {t('startWork')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {/* If work is in progress, allow marking as complete */}
              {order.status === "inProgress" && (
                <Button
                  data-testid="booking-complete"
                  variant="workshop"
                  className="flex-1"
                  onClick={() => onStatusChange(order.id, "completed", order.backendStatus)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('markComplete')}
                </Button>
              )}
            </div>
          )}

          {/* W11: Invoice Export for completed orders */}
          {order.status === "completed" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleExportInvoice}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('exportInvoice')}
            </Button>
          )}

          {/* Cancelled notice */}
          {order.status === "cancelled" && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 py-3 text-sm font-medium text-destructive">
              <X className="h-4 w-4" />
              {t('cancelledNotice')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
