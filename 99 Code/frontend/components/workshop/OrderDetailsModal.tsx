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
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Order {
  id: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  vehiclePlate: string;
  service: string;
  status: "pending" | "inProgress" | "completed" | "cancelled";
  backendStatus?: string; // Original backend BookingStatus for FSM transitions
  date: string;
  pickupAddress: string;
  notes?: string;
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
      label: language === "de" ? "Storniert" : "Cancelled",
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
            <Badge className={statusConfig[order.status].class}>
              {statusConfig[order.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <User className="h-4 w-4 text-primary" />
              {t('customer')}
            </h3>
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <p className="font-medium">{order.customer}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {order.customerEmail}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {order.customerPhone}
              </div>
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

          {/* Notes */}
          {order.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold">{t('notes')}</h3>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{order.notes || t('noNotes')}</p>
              </div>
            </div>
          )}

          {/* Actions - FSM-aware transitions */}
          {/* FSM Flow: PICKED_UP -> AT_WORKSHOP -> IN_SERVICE -> READY_FOR_RETURN */}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <div className="flex gap-3">
              {/* If vehicle is picked up (en route), allow marking as arrived */}
              {order.backendStatus === "PICKED_UP" && (
                <Button
                  variant="workshop"
                  className="flex-1"
                  onClick={() => onStatusChange(order.id, "inProgress", order.backendStatus)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {language === "de" ? "Als angekommen markieren" : "Mark as Arrived"}
                </Button>
              )}
              {/* If vehicle is at workshop, allow starting work */}
              {order.backendStatus === "AT_WORKSHOP" && (
                <Button
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

          {/* Cancelled notice */}
          {order.status === "cancelled" && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 py-3 text-sm font-medium text-destructive">
              <X className="h-4 w-4" />
              {language === "de" ? "Dieser Auftrag wurde storniert" : "This order has been cancelled"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
