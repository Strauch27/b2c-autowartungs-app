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
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

interface Order {
  id: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  vehiclePlate: string;
  service: string;
  status: "pending" | "inProgress" | "completed";
  date: string;
  pickupAddress: string;
  notes?: string;
}

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onStatusChange: (orderId: string, newStatus: "pending" | "inProgress" | "completed") => void;
}

const OrderDetailsModal = ({
  open,
  onOpenChange,
  order,
  onStatusChange,
}: OrderDetailsModalProps) => {
  const { language } = useLanguage();

  const t = {
    de: {
      title: "Auftragsdetails",
      customer: "Kundeninformationen",
      vehicle: "Fahrzeuginformationen",
      service: "Service",
      timeline: "Status-Verlauf",
      address: "Abhol-/Rückgabeadresse",
      notes: "Anmerkungen",
      noNotes: "Keine Anmerkungen",
      startWork: "Bearbeitung starten",
      markComplete: "Als abgeschlossen markieren",
      status: {
        pending: "Ausstehend",
        inProgress: "In Bearbeitung",
        completed: "Abgeschlossen",
      },
      steps: {
        received: "Auftrag eingegangen",
        inProgress: "In Bearbeitung",
        completed: "Abgeschlossen",
      },
    },
    en: {
      title: "Order Details",
      customer: "Customer Information",
      vehicle: "Vehicle Information",
      service: "Service",
      timeline: "Status Timeline",
      address: "Pickup/Return Address",
      notes: "Notes",
      noNotes: "No notes",
      startWork: "Start Work",
      markComplete: "Mark as Complete",
      status: {
        pending: "Pending",
        inProgress: "In Progress",
        completed: "Completed",
      },
      steps: {
        received: "Order Received",
        inProgress: "In Progress",
        completed: "Completed",
      },
    },
  };

  const texts = t[language];

  const statusConfig = {
    pending: {
      label: texts.status.pending,
      class: "badge-pending",
    },
    inProgress: {
      label: texts.status.inProgress,
      class: "badge-in-progress",
    },
    completed: {
      label: texts.status.completed,
      class: "badge-completed",
    },
  };

  const timelineSteps = [
    { key: "received", label: texts.steps.received, completed: true },
    { key: "inProgress", label: texts.steps.inProgress, completed: order.status === "inProgress" || order.status === "completed" },
    { key: "completed", label: texts.steps.completed, completed: order.status === "completed" },
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
              {texts.customer}
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
              {texts.vehicle}
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
              {texts.service}
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
              {texts.address}
            </h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm">{order.pickupAddress}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-primary" />
              {texts.timeline}
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
              <h3 className="font-semibold">{texts.notes}</h3>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{order.notes || texts.noNotes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {order.status !== "completed" && (
            <div className="flex gap-3">
              {order.status === "pending" && (
                <Button
                  variant="workshop"
                  className="flex-1"
                  onClick={() => onStatusChange(order.id, "inProgress")}
                >
                  {texts.startWork}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {order.status === "inProgress" && (
                <Button
                  variant="workshop"
                  className="flex-1"
                  onClick={() => onStatusChange(order.id, "completed")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {texts.markComplete}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
