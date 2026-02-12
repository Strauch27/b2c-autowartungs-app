'use client';

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loader2, Car, CalendarIcon, X, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import ExtensionModal from "@/components/workshop/ExtensionModal";
import { workshopsApi, WorkshopOrder, CreateExtensionData } from "@/lib/api/workshops";
import { resolveVehicleDisplay } from "@/lib/constants/vehicles";
import { toast } from "sonner";
import { WorkshopStatsBar } from "@/components/workshop/WorkshopStatsBar";
import { KanbanBoard } from "@/components/workshop/KanbanBoard";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isSameDay, isAfter, startOfDay, addDays, isTomorrow, isToday } from "date-fns";
import { de, enUS } from "date-fns/locale";

interface Order {
  id: string;
  bookingNumber: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  vehicleBrandLogo?: string;
  vehiclePlate: string;
  vehicleMileage?: number;
  vehicleYear?: number;
  vehicleId?: string;
  service: string;
  status: "pending" | "inProgress" | "completed" | "cancelled";
  backendStatus?: string;
  date: string;
  rawPickupDate: Date;
  deliveryDeadline?: Date;
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);

  const dateLocale = language === 'de' ? de : enUS;

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
  const orders = workshopOrders.map(o => {
    const vd = o.vehicle ? resolveVehicleDisplay(o.vehicle.brand, o.vehicle.model) : null;
    // Deadline: 3h before delivery date (so jockey has time to return car)
    let deliveryDeadline: Date | undefined;
    if (o.deliveryDate) {
      deliveryDeadline = new Date(new Date(o.deliveryDate).getTime() - 3 * 60 * 60 * 1000);
    }
    return {
      id: o.bookingNumber,
      bookingNumber: o.bookingNumber,
      customer: o.customer ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() : 'Customer',
      customerEmail: o.customer?.email || '',
      customerPhone: o.customer?.phone || '',
      vehicle: vd ? `${vd.brandName} ${language === 'en' && vd.modelNameEn ? vd.modelNameEn : vd.modelName}` : 'Vehicle',
      vehicleBrandLogo: vd?.brandLogo,
      vehiclePlate: o.vehicle?.licensePlate || '',
      vehicleMileage: o.vehicle?.mileage,
      vehicleYear: o.vehicle?.year,
      vehicleId: o.vehicle?.id,
      service: Array.isArray(o.services) && o.services.length > 0
        ? `${o.services.length} ${t.workshopDashboard.services}`
        : (serviceTypeLabels[o.serviceType] || o.serviceType),
      status: mapStatus(o.status),
      backendStatus: o.status,
      date: new Date(o.pickupDate).toLocaleDateString(language === "de" ? "de-DE" : "en-US"),
      rawPickupDate: new Date(o.pickupDate),
      deliveryDeadline,
      pickupAddress: `${o.pickupAddress}, ${o.pickupPostalCode} ${o.pickupCity}`,
      notes: o.customerNotes,
      extensionApproved: Array.isArray((o as any).extensions) && (o as any).extensions.some((e: any) => e.status === 'APPROVED'),
    };
  }) as Order[];

  // Filter by search and date
  const filteredOrders = orders.filter(o => {
    // Date filter
    if (selectedDate && !isSameDay(o.rawPickupDate, selectedDate)) {
      return false;
    }
    // Search filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return o.id.toLowerCase().includes(q)
      || o.customer.toLowerCase().includes(q)
      || o.vehicle.toLowerCase().includes(q);
  });

  // Stats based on filtered orders
  const stats = {
    newCount: filteredOrders.filter(o => o.status === 'pending').length,
    inProgressCount: filteredOrders.filter(o => o.status === 'inProgress').length,
    completedCount: filteredOrders.filter(o => o.status === 'completed').length,
  };

  // Upcoming orders: future orders grouped by date (next 7 days)
  const upcomingGroups = useMemo(() => {
    const today = startOfDay(new Date());
    const endDate = addDays(today, 7);

    const futureOrders = orders.filter(o => {
      const d = startOfDay(o.rawPickupDate);
      return isAfter(d, today) || isSameDay(d, addDays(today, 1));
    }).filter(o => {
      const d = startOfDay(o.rawPickupDate);
      return !isAfter(d, endDate);
    });

    // Group by date
    const groups: Record<string, Order[]> = {};
    for (const order of futureOrders) {
      const key = startOfDay(order.rawPickupDate).toISOString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    }

    // Sort by date and convert to array
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([dateStr, groupOrders]) => {
        const date = new Date(dateStr);
        let label: string;
        if (isToday(date)) {
          label = t.workshopDashboard.upcoming.today;
        } else if (isTomorrow(date)) {
          label = t.workshopDashboard.upcoming.tomorrow;
        } else {
          label = format(date, 'EEEE, d. MMMM', { locale: dateLocale });
        }
        return { date, label, orders: groupOrders };
      });
  }, [orders, language]);

  const handleAccept = async (orderId: string, currentBackendStatus?: string) => {
    try {
      let targetStatus: string;
      if (currentBackendStatus === 'PICKUP_ASSIGNED') {
        // Can't accept yet - jockey hasn't picked up. This shouldn't be called.
        toast.error(language === 'de' ? 'Fahrzeug muss erst vom Jockey abgeholt werden' : 'Vehicle must be picked up by jockey first');
        return;
      } else if (currentBackendStatus === 'PICKED_UP') {
        targetStatus = 'AT_WORKSHOP';
      } else if (currentBackendStatus === 'AT_WORKSHOP') {
        targetStatus = 'IN_SERVICE';
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

  const handleExtensionSubmit = async (description: string, items: any[]) => {
    try {
      const order = workshopOrders.find(o => o.bookingNumber === extensionModal.orderId);
      if (!order) {
        throw new Error('Booking not found');
      }
      const extensionData: CreateExtensionData = {
        description: description || items.map(item => item.name).join(', '),
        items: items.map(item => ({
          name: item.name,
          price: Math.round(parseFloat(item.unitPrice) * 100),
          quantity: item.quantity || 1,
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
        })),
      };
      await workshopsApi.createExtension(order.id, extensionData);
      toast.success(t.workshopDashboard.toast.extensionSent);
      // Refresh orders to show updated extension state
      const result = await workshopsApi.getOrders({ limit: 50 });
      setWorkshopOrders(result.orders);
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
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6" data-testid="workshop-dashboard">
      {/* Stats Bar */}
      <div className="mb-6">
        <WorkshopStatsBar
          newCount={stats.newCount}
          inProgressCount={stats.inProgressCount}
          completedCount={stats.completedCount}
        />
      </div>

      {/* Search + Date Picker */}
      <div className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <svg className="absolute left-3 top-3 h-4 w-4 text-muted-foreground sm:top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t.workshopDashboard.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/30 min-h-[44px]"
              data-testid="workshop-search-input"
            />
          </div>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors min-h-[44px] ${
                  selectedDate
                    ? 'border-cta bg-cta/5 text-cta'
                    : 'border-neutral-200 text-muted-foreground hover:border-neutral-300'
                }`}
                data-testid="workshop-date-picker-trigger"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {selectedDate
                    ? format(selectedDate, 'dd.MM.yyyy')
                    : t.workshopDashboard.datePicker.allDates}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={dateLocale}
              />
              {selectedDate && (
                <div className="border-t px-3 py-2">
                  <button
                    onClick={() => setSelectedDate(undefined)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs text-muted-foreground hover:bg-neutral-100"
                  >
                    <X className="h-3 w-3" />
                    {t.workshopDashboard.datePicker.clearDate}
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Kanban Board or Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Car className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchQuery || selectedDate
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

      {/* Upcoming Orders Section */}
      {upcomingGroups.length > 0 && (
        <div className="mt-8" data-testid="workshop-upcoming-orders">
          <button
            onClick={() => setUpcomingExpanded(!upcomingExpanded)}
            className="mb-4 flex w-full items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 text-left transition-colors hover:bg-neutral-100"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cta" />
              <h2 className="text-base font-semibold text-foreground">
                {t.workshopDashboard.upcoming.title}
              </h2>
              <span className="rounded-full bg-cta/10 px-2 py-0.5 text-xs font-medium text-cta">
                {upcomingGroups.reduce((sum, g) => sum + g.orders.length, 0)}
              </span>
            </div>
            {upcomingExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {upcomingExpanded && (
            <div className="space-y-4">
              {upcomingGroups.map(group => (
                <div key={group.date.toISOString()}>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                    <span className="text-xs text-muted-foreground">
                      ({group.orders.length})
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.orders.map(order => (
                      <button
                        key={order.id}
                        onClick={() => router.push(`/${language}/workshop/orders/${order.id}`)}
                        className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-card p-3 text-left transition-colors hover:border-cta/30 hover:bg-cta/5 min-h-[44px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-cta">{order.bookingNumber}</span>
                          <span className="text-xs text-muted-foreground">{order.date}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{order.customer}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          {order.vehicleBrandLogo && <img src={order.vehicleBrandLogo} alt="" className="w-4 h-4 object-contain shrink-0" />}
                          {order.vehicle} {order.vehiclePlate ? `· ${order.vehiclePlate}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.service}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
