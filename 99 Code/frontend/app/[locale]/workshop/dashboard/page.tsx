'use client';

import { useState, useEffect } from "react";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUser } from '@/lib/auth-hooks';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Car,
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  ChevronDown,
  Plus,
  Eye,
  Loader2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BarChart3,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import OrderDetailsModal from "@/components/workshop/OrderDetailsModal";
import ExtensionModal from "@/components/workshop/ExtensionModal";
import { workshopsApi, WorkshopOrder, CreateExtensionData } from "@/lib/api/workshops";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Load LanguageSwitcher without SSR to avoid hydration mismatch
const LanguageSwitcher = dynamic(() => import("@/components/LanguageSwitcher"), {
  ssr: false,
});

const ORDERS_PER_PAGE = 10;

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

function DashboardContent() {
  const user = useUser();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [workshopOrders, setWorkshopOrders] = useState<WorkshopOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    order: Order | null;
  }>({ open: false, order: null });
  const [extensionModal, setExtensionModal] = useState<{
    open: boolean;
    orderId: string;
    customerName: string;
  }>({ open: false, orderId: "", customerName: "" });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'inProgress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [language]);

  const today = new Date().toLocaleDateString(language === "de" ? "de-DE" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Map booking status to workshop order status
  // FSM Flow: PICKED_UP -> AT_WORKSHOP -> IN_SERVICE -> READY_FOR_RETURN
  const mapStatus = (bookingStatus: string): "pending" | "inProgress" | "completed" | "cancelled" => {
    // Cancelled state (separate from completed)
    if (bookingStatus === 'CANCELLED') return "cancelled";
    // Completed states (service done, ready for return)
    if (['DELIVERED', 'COMPLETED', 'READY_FOR_RETURN', 'RETURN_ASSIGNED', 'RETURNED'].includes(bookingStatus)) return "completed";
    // In progress states (workshop actively working)
    if (['IN_SERVICE', 'IN_WORKSHOP'].includes(bookingStatus)) return "inProgress";
    // Pending states (vehicle arrived or in transit)
    // PICKED_UP = Jockey has vehicle, en route to workshop
    // AT_WORKSHOP = Vehicle physically at workshop, awaiting service start
    if (['AT_WORKSHOP', 'PICKED_UP'].includes(bookingStatus)) return "pending";
    return "pending";
  };

  // Convert workshop orders to display format
  const orders = workshopOrders.map(o => ({
    id: o.bookingNumber,
    customer: o.customer ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() : 'Customer',
    customerEmail: o.customer?.email || '',
    customerPhone: o.customer?.phone || '',
    vehicle: o.vehicle ? `${o.vehicle.brand} ${o.vehicle.model}` : 'Vehicle',
    vehiclePlate: o.vehicle?.licensePlate || '',
    vehicleId: o.vehicle?.id,
    service: Array.isArray(o.services) && o.services.length > 0
      ? `${o.services.length} ${t.workshopDashboard.services}`
      : o.serviceType,
    status: mapStatus(o.status),
    backendStatus: o.status, // Keep original backend status for FSM transitions
    date: new Date(o.pickupDate).toLocaleDateString(language === "de" ? "de-DE" : "en-US"),
    pickupAddress: `${o.pickupAddress}, ${o.pickupPostalCode} ${o.pickupCity}`,
    notes: o.customerNotes,
  })) as Order[];

  // Sort by status priority: pending first, then inProgress, then completed
  const statusPriority: Record<string, number> = { pending: 0, inProgress: 1, completed: 2, cancelled: 3 };
  orders.sort((a, b) => (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9));

  // Filter orders
  const filteredOrders = orders
    .filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      return true;
    })
    .filter(o => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return o.id.toLowerCase().includes(q)
        || o.customer.toLowerCase().includes(q)
        || o.vehicle.toLowerCase().includes(q);
    });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * ORDERS_PER_PAGE,
    safeCurrentPage * ORDERS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const filterLabels: Record<string, string> = {
    all: t.workshopDashboard.filter.all,
    pending: t.workshopDashboard.filter.pending,
    inProgress: t.workshopDashboard.filter.inProgress,
    completed: t.workshopDashboard.filter.completed,
  };

  const statusConfig = {
    pending: {
      label: t.workshopDashboard.status.received,
      class: "badge-pending",
      icon: Clock,
    },
    inProgress: {
      label: t.workshopDashboard.status.inProgress,
      class: "badge-in-progress",
      icon: Wrench,
    },
    completed: {
      label: t.workshopDashboard.status.completed,
      class: "badge-completed",
      icon: CheckCircle,
    },
    cancelled: {
      label: t.workshopDashboard.status.cancelled,
      class: "badge-destructive",
      icon: X,
    },
  };

  const todayStr = new Date().toLocaleDateString(language === "de" ? "de-DE" : "en-US");
  const stats = {
    today: orders.filter((o) => o.date === todayStr).length,
    inProgress: orders.filter((o) => o.status === "inProgress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  const handleStatusChange = async (orderId: string, newStatus: "pending" | "inProgress" | "completed" | "cancelled", currentBackendStatus?: string) => {
    try {
      // Intelligent status mapping based on current backend status
      // FSM Flow: PICKED_UP -> AT_WORKSHOP -> IN_SERVICE -> READY_FOR_RETURN
      let targetStatus: string;

      if (newStatus === "pending") {
        // This transition shouldn't normally happen, but handle it
        targetStatus = 'AT_WORKSHOP';
      } else if (newStatus === "inProgress") {
        // From pending (PICKED_UP or AT_WORKSHOP) -> IN_SERVICE
        if (currentBackendStatus === 'PICKED_UP') {
          // Special case: vehicle arrived, mark as AT_WORKSHOP first
          targetStatus = 'AT_WORKSHOP';
        } else {
          // Normal case: AT_WORKSHOP -> IN_SERVICE
          targetStatus = 'IN_SERVICE';
        }
      } else if (newStatus === "completed") {
        // From inProgress (IN_SERVICE) -> READY_FOR_RETURN
        targetStatus = 'READY_FOR_RETURN';
      } else {
        targetStatus = 'AT_WORKSHOP'; // Fallback
      }

      await workshopsApi.updateStatus(orderId, targetStatus);

      toast.success(t.workshopDashboard.toast.statusUpdated);

      // Refresh orders to show updated status
      const result = await workshopsApi.getOrders({ limit: 50 });
      setWorkshopOrders(result.orders);

      setDetailsModal({ open: false, order: null });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(t.workshopDashboard.toast.statusFailed);
    }
  };

  const handleExtensionSubmit = async (items: any[], photos: string[]) => {
    try {
      // Find the actual booking ID from the booking number
      const order = workshopOrders.find(o => o.bookingNumber === extensionModal.orderId);
      if (!order) {
        throw new Error('Booking not found');
      }

      // Convert items to the correct format
      const extensionData: CreateExtensionData = {
        description: items.map(item => item.description).join(', '),
        items: items.map(item => ({
          name: item.description,
          price: parseFloat(item.price) * 100, // Convert to cents
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href={`/${language}`} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-workshop">
                <Wrench className="h-5 w-5 text-workshop-foreground" />
              </div>
            </Link>
            <div>
              <p className="font-semibold">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/${language}/workshop/calendar`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <CalendarDays className="mr-2 h-4 w-4" />
                {t.workshopDashboard.links.calendar}
              </Button>
            </Link>
            <Link href={`/${language}/workshop/stats`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <BarChart3 className="mr-2 h-4 w-4" />
                {t.workshopDashboard.links.stats}
              </Button>
            </Link>
            <Link href={`/${language}/workshop/team`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                {t.workshopDashboard.links.team}
              </Button>
            </Link>
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${language}`)}
              className="text-muted-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t.dashboard.logout}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="card-premium border-l-4 border-l-workshop">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-workshop/10">
                <Car className="h-6 w-6 text-workshop" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-sm text-muted-foreground">{t.workshopDashboard.stats.ordersToday}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-premium border-l-4 border-l-cta">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cta/10">
                <Wrench className="h-6 w-6 text-cta" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">{t.workshopDashboard.stats.inProgress}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-premium border-l-4 border-l-success">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">{t.workshopDashboard.stats.completed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="card-premium">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{t.workshopDashboard.orders}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'inProgress', 'completed'] as const).map((key) => (
                  <Button
                    key={key}
                    variant={statusFilter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(key)}
                  >
                    {filterLabels[key]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="relative mt-3 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.workshopDashboard.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Car className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? t.workshopDashboard.noMatchingOrders
                    : t.workshopDashboard.noOrders}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.workshopDashboard.table.orderId}</TableHead>
                      <TableHead>{t.workshopDashboard.table.customer}</TableHead>
                      <TableHead>{t.workshopDashboard.table.vehicle}</TableHead>
                      <TableHead>{t.workshopDashboard.table.service}</TableHead>
                      <TableHead>{t.workshopDashboard.table.status}</TableHead>
                      <TableHead className="text-right">{t.workshopDashboard.table.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => {
                    const config = statusConfig[order.status];
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.vehicle}</TableCell>
                        <TableCell>{order.service}</TableCell>
                        <TableCell>
                          <Badge data-testid="booking-status" className={`${config.class} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailsModal({ open: true, order })}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              {t.workshopDashboard.viewDetails}
                            </Button>
                            {order.status === "inProgress" && (
                              <Button
                                variant="workshop"
                                size="sm"
                                onClick={() =>
                                  setExtensionModal({
                                    open: true,
                                    orderId: order.id,
                                    customerName: order.customer,
                                  })
                                }
                              >
                                <Plus className="mr-1 h-4 w-4" />
                                {t.workshopDashboard.createExtension}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {filteredOrders.length > ORDERS_PER_PAGE && (
                  <div className="flex items-center justify-between border-t border-border px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      {t.workshopDashboard.pagination.page} {safeCurrentPage} {t.workshopDashboard.pagination.of} {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safeCurrentPage <= 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        {t.workshopDashboard.pagination.previous}
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={page === safeCurrentPage ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safeCurrentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      >
                        {t.workshopDashboard.pagination.next}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="card-premium mt-6 border-l-4 border-l-primary bg-primary/5">
          <CardContent className="flex items-start gap-4 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">
                {t.workshopDashboard.tip.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.workshopDashboard.tip.text}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Order Details Modal */}
      {detailsModal.order && (
        <OrderDetailsModal
          open={detailsModal.open}
          onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}
          order={detailsModal.order}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Extension Modal */}
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
