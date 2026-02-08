'use client';

import { useState, useEffect } from "react";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loader2, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import ExtensionModal from "@/components/workshop/ExtensionModal";
import { workshopsApi, WorkshopOrder, CreateExtensionData } from "@/lib/api/workshops";
import { toast } from "sonner";
import { WorkshopStatsBar } from "@/components/workshop/WorkshopStatsBar";
import { KanbanBoard } from "@/components/workshop/KanbanBoard";

interface Order {
  id: string;
  bookingNumber: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  vehiclePlate: string;
  vehicleId?: string;
  service: string;
  status: "pending" | "inProgress" | "completed" | "cancelled";
  backendStatus?: string;
  date: string;
  pickupAddress: string;
  notes?: string;
  extensionApproved?: boolean;
}

function DashboardContent() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [workshopOrders, setWorkshopOrders] = useState<WorkshopOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [extensionModal, setExtensionModal] = useState<{
    open: boolean;
    orderId: string;
    customerName: string;
  }>({ open: false, orderId: "", customerName: "" });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchOrders(isRefresh = false) {
      try {
        if (!isRefresh) setIsLoading(true);
        const result = await workshopsApi.getOrders({ limit: 50 });
        setWorkshopOrders(result.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        if (!isRefresh) {
          toast.error(t.workshopDashboard.toast.loadFailed);
        }
      } finally {
        if (!isRefresh) setIsLoading(false);
      }
    }

    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [language]);

  // Map booking status to workshop order status
  const mapStatus = (bookingStatus: string): "pending" | "inProgress" | "completed" | "cancelled" => {
    if (bookingStatus === 'CANCELLED') return "cancelled";
    if (['DELIVERED', 'COMPLETED', 'READY_FOR_RETURN', 'RETURN_ASSIGNED', 'RETURNED'].includes(bookingStatus)) return "completed";
    if (['IN_SERVICE', 'IN_WORKSHOP'].includes(bookingStatus)) return "inProgress";
    if (['AT_WORKSHOP', 'PICKED_UP'].includes(bookingStatus)) return "pending";
    return "pending";
  };

  // Service type translations
  const serviceTypeLabels: Record<string, string> = language === 'de'
    ? { INSPECTION: 'Inspektion', OIL_SERVICE: 'Ölwechsel', BRAKE_SERVICE: 'Bremsendienst', TUV: 'TÜV/HU', CLIMATE_SERVICE: 'Klimaservice', CUSTOM: 'Sonderleistung' }
    : { INSPECTION: 'Inspection', OIL_SERVICE: 'Oil Change', BRAKE_SERVICE: 'Brake Service', TUV: 'TÜV/MOT', CLIMATE_SERVICE: 'Climate Service', CUSTOM: 'Custom Service' };

  // Convert workshop orders to display format
  const orders = workshopOrders.map(o => ({
    id: o.bookingNumber,
    bookingNumber: o.bookingNumber,
    customer: o.customer ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() : 'Customer',
    customerEmail: o.customer?.email || '',
    customerPhone: o.customer?.phone || '',
    vehicle: o.vehicle ? `${o.vehicle.brand} ${o.vehicle.model}` : 'Vehicle',
    vehiclePlate: o.vehicle?.licensePlate || '',
    vehicleId: o.vehicle?.id,
    service: Array.isArray(o.services) && o.services.length > 0
      ? `${o.services.length} ${t.workshopDashboard.services}`
      : (serviceTypeLabels[o.serviceType] || o.serviceType),
    status: mapStatus(o.status),
    backendStatus: o.status,
    date: new Date(o.pickupDate).toLocaleDateString(language === "de" ? "de-DE" : "en-US"),
    pickupAddress: `${o.pickupAddress}, ${o.pickupPostalCode} ${o.pickupCity}`,
    notes: o.customerNotes,
  })) as Order[];

  // Filter by search
  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return o.id.toLowerCase().includes(q)
      || o.customer.toLowerCase().includes(q)
      || o.vehicle.toLowerCase().includes(q);
  });

  // Stats
  const stats = {
    newCount: orders.filter(o => o.status === 'pending').length,
    inProgressCount: orders.filter(o => o.status === 'inProgress').length,
    completedCount: orders.filter(o => o.status === 'completed').length,
  };

  const handleAccept = async (orderId: string, currentBackendStatus?: string) => {
    try {
      let targetStatus: string;
      if (currentBackendStatus === 'PICKED_UP') {
        targetStatus = 'AT_WORKSHOP';
      } else {
        targetStatus = 'IN_SERVICE';
      }
      await workshopsApi.updateStatus(orderId, targetStatus);
      toast.success(t.workshopDashboard.toast.statusUpdated);
      const result = await workshopsApi.getOrders({ limit: 50 });
      setWorkshopOrders(result.orders);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(t.workshopDashboard.toast.statusFailed);
    }
  };

  const handleComplete = async (orderId: string, currentBackendStatus?: string) => {
    try {
      await workshopsApi.updateStatus(orderId, 'READY_FOR_RETURN');
      toast.success(t.workshopDashboard.toast.statusUpdated);
      const result = await workshopsApi.getOrders({ limit: 50 });
      setWorkshopOrders(result.orders);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(t.workshopDashboard.toast.statusFailed);
    }
  };

  const handleExtensionSubmit = async (items: any[], photos: string[]) => {
    try {
      const order = workshopOrders.find(o => o.bookingNumber === extensionModal.orderId);
      if (!order) {
        throw new Error('Booking not found');
      }
      const extensionData: CreateExtensionData = {
        description: items.map(item => item.description).join(', '),
        items: items.map(item => ({
          name: item.description,
          price: parseFloat(item.price) * 100,
          quantity: 1
        })),
        images: photos
      };
      await workshopsApi.createExtension(order.id, extensionData);
      toast.success(t.workshopDashboard.toast.extensionSent);
    } catch (error) {
      console.error("Failed to submit extension:", error);
      toast.error(t.workshopDashboard.toast.extensionFailed);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6" data-testid="workshop-dashboard">
      {/* Stats Bar */}
      <div className="mb-6">
        <WorkshopStatsBar
          newCount={stats.newCount}
          inProgressCount={stats.inProgressCount}
          completedCount={stats.completedCount}
        />
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t.workshopDashboard.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/30"
            data-testid="workshop-search-input"
          />
        </div>
      </div>

      {/* Kanban Board or Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Car className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchQuery
              ? t.workshopDashboard.noMatchingOrders
              : t.workshopDashboard.noOrders}
          </p>
        </div>
      ) : (
        <KanbanBoard
          orders={filteredOrders}
          onAccept={handleAccept}
          onComplete={handleComplete}
          onOpenDetails={(order) => router.push(`/${language}/workshop/orders/${order.id}`)}
          onOpenExtension={(orderId, customerName) =>
            setExtensionModal({ open: true, orderId, customerName })
          }
        />
      )}

      {/* Extension Modal (backward compat) */}
      <ExtensionModal
        open={extensionModal.open}
        onOpenChange={(open) => setExtensionModal({ ...extensionModal, open })}
        orderId={extensionModal.orderId}
        customerName={extensionModal.customerName}
        onSubmit={handleExtensionSubmit}
      />
    </div>
  );
}

export default function WorkshopDashboardPage() {
  return (
    <ProtectedRoute requiredRole="workshop">
      <DashboardContent />
    </ProtectedRoute>
  );
}
