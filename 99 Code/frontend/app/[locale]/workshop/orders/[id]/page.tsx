'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { workshopsApi, WorkshopOrder, CreateExtensionData } from '@/lib/api/workshops';
import { StatusTimeline } from '@/components/workshop/StatusTimeline';
import { ExtensionForm } from '@/components/workshop/ExtensionForm';
import { CommunicationSection } from '@/components/workshop/CommunicationSection';
import { Loader2, ArrowLeft, Phone, Mail, MapPin, Calendar, Car, User, Wrench, FileText } from 'lucide-react';
import { resolveVehicleDisplay } from '@/lib/constants/vehicles';
import { JockeyTimeline } from '@/components/shared/JockeyTimeline';
import { toast } from 'sonner';
import { MapView } from '@/components/ui/MapView';
import { useGeocode } from '@/lib/useGeocode';
import { Button } from '@/components/ui/button';

function mapDisplayStatus(bookingStatus: string): 'pending' | 'inProgress' | 'completed' | 'cancelled' {
  if (bookingStatus === 'CANCELLED') return 'cancelled';
  if (['DELIVERED', 'COMPLETED', 'READY_FOR_RETURN', 'RETURN_ASSIGNED', 'RETURNED'].includes(bookingStatus)) return 'completed';
  if (['IN_SERVICE', 'IN_WORKSHOP'].includes(bookingStatus)) return 'inProgress';
  if (['AT_WORKSHOP', 'PICKED_UP'].includes(bookingStatus)) return 'pending';
  return 'pending';
}

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('workshopDashboard');
  const td = useTranslations('workshopDashboard.detail');
  const ts = useTranslations('payment.serviceTypes');
  const locale = useLocale();

  const bookingId = params.id as string;

  const [order, setOrder] = useState<WorkshopOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const orderAddress = order
    ? `${order.pickupAddress}, ${order.pickupPostalCode} ${order.pickupCity}`
    : undefined;
  const coords = useGeocode(orderAddress);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setIsLoading(true);
        const data = await workshopsApi.getOrder(bookingId);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error(t('toast.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    }
    if (bookingId) fetchOrder();
  }, [bookingId]);

  const handleStatusAdvance = async () => {
    if (!order) return;
    try {
      let targetStatus: string;
      const currentStatus = order.status;
      if (currentStatus === 'PICKED_UP') {
        targetStatus = 'AT_WORKSHOP';
      } else if (currentStatus === 'AT_WORKSHOP') {
        targetStatus = 'IN_SERVICE';
      } else if (['IN_SERVICE', 'IN_WORKSHOP'].includes(currentStatus)) {
        targetStatus = 'READY_FOR_RETURN';
      } else {
        return;
      }
      await workshopsApi.updateStatus(order.bookingNumber, targetStatus);
      toast.success(t('toast.statusUpdated'));
      const updated = await workshopsApi.getOrder(bookingId);
      setOrder(updated);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(t('toast.statusFailed'));
    }
  };

  const handleExtensionSubmit = async (description: string, items: Array<{ id: string; name: string; quantity: number; unitPrice: string }>) => {
    if (!order) return;
    try {
      const extensionData: CreateExtensionData = {
        description,
        items: items.map(item => ({
          name: item.name,
          price: parseFloat(item.unitPrice) * 100,
          quantity: item.quantity,
        })),
      };
      await workshopsApi.createExtension(order.id, extensionData);
      toast.success(t('toast.extensionSent'));
      setShowExtensionForm(false);
      const updated = await workshopsApi.getOrder(bookingId);
      setOrder(updated);
    } catch (error) {
      console.error('Failed to submit extension:', error);
      toast.error(t('toast.extensionFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">{td('orderNotFound')}</p>
        <Button
          variant="link"
          onClick={() => router.push(`/${locale}/workshop/dashboard`)}
        >
          {td('back')}
        </Button>
      </div>
    );
  }

  const displayStatus = mapDisplayStatus(order.status);
  const customerName = order.customer
    ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
    : '';
  const vd = order.vehicle ? resolveVehicleDisplay(order.vehicle.brand, order.vehicle.model) : null;
  const vehicleLabel = vd
    ? `${vd.brandName} ${locale === 'en' && vd.modelNameEn ? vd.modelNameEn : vd.modelName}`
    : '';
  const vehicleBrandLogo = vd?.brandLogo;

  // Status advancement button config
  const getAdvanceButton = () => {
    const status = order.status;
    if (status === 'PICKED_UP') {
      return { label: td('markArrived'), variant: 'default' as const };
    }
    if (status === 'AT_WORKSHOP') {
      return { label: td('startWork'), variant: 'cta' as const };
    }
    if (['IN_SERVICE', 'IN_WORKSHOP'].includes(status)) {
      return { label: td('markCompleted'), variant: 'success' as const };
    }
    return null;
  };

  const advanceButton = getAdvanceButton();

  // Status badge colors
  const statusBadge = {
    pending: 'badge-pending',
    inProgress: 'badge-in-progress',
    completed: 'badge-completed',
    cancelled: 'bg-neutral-100 text-neutral-600',
  }[displayStatus];

  const statusLabel = {
    pending: t('status.received'),
    inProgress: t('status.inProgress'),
    completed: t('status.completed'),
    cancelled: t('status.cancelled'),
  }[displayStatus];

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6" data-testid="workshop-order-detail">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/${locale}/workshop/dashboard`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{order.bookingNumber}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {vehicleBrandLogo && <img src={vehicleBrandLogo} alt="" className="w-4 h-4 object-contain" />}
              {vehicleLabel}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>
          {statusLabel}
        </span>
      </div>

      {/* Status advancement */}
      {advanceButton && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{td('changeStatus')}</p>
              <p className="text-xs text-muted-foreground">{td('statusTimeline')}</p>
            </div>
            <Button
              variant={advanceButton.variant}
              size="lg"
              onClick={handleStatusAdvance}
              className="w-full sm:w-auto"
              data-testid="status-advance-button"
            >
              {advanceButton.label}
            </Button>
          </div>
          <div className="mt-4">
            <StatusTimeline currentStatus={displayStatus} />
          </div>
        </div>
      )}

      {/* Two-column info */}
      <div className="mb-6 grid gap-4 sm:gap-5 lg:grid-cols-2">
        {/* Left: Vehicle + Customer */}
        <div className="space-y-4 sm:space-y-5">
          {/* Vehicle Info */}
          <div className="rounded-xl border border-neutral-200 bg-card p-4 shadow-sm sm:p-5">
            <p className="text-overline mb-3 text-muted-foreground">{td('vehicleInfo')}</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                {vehicleBrandLogo ? (
                  <img src={vehicleBrandLogo} alt="" className="h-5 w-5 object-contain" />
                ) : (
                  <Car className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">{td('brandModel')}</p>
                  <p className="text-sm font-medium">{vehicleLabel || '--'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{td('plate')}</p>
                  <p className="text-sm font-medium">{order.vehicle?.licensePlate || '--'}</p>
                </div>
              </div>
              {order.vehicle?.year && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{td('year')}</p>
                    <p className="text-sm font-medium">{order.vehicle.year}</p>
                  </div>
                </div>
              )}
              {order.vehicle?.mileage && (
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{td('mileage')}</p>
                    <p className="text-sm font-medium">{order.vehicle.mileage.toLocaleString()} km</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-xl border border-neutral-200 bg-card p-4 shadow-sm sm:p-5">
            <p className="text-overline mb-3 text-muted-foreground">{td('customerInfo')}</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{customerName || '--'}</p>
              </div>
              {order.customer?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${order.customer.email}`} className="text-sm text-primary hover:underline">
                    {order.customer.email}
                  </a>
                </div>
              )}
              {order.customer?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${order.customer.phone}`} className="text-sm text-primary hover:underline">
                    {order.customer.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{td('pickupReturnAddress')}</p>
                  <p className="text-sm font-medium">
                    {order.pickupAddress}, {order.pickupPostalCode} {order.pickupCity}
                  </p>
                </div>
              </div>
              <MapView
                lat={coords?.lat}
                lng={coords?.lng}
                address={orderAddress}
                height="h-[160px] md:h-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Right: Service Details + Notes */}
        <div className="space-y-4 sm:space-y-5">
          {/* Service Details */}
          <div className="rounded-xl border border-neutral-200 bg-card p-4 shadow-sm sm:p-5">
            <p className="text-overline mb-3 text-muted-foreground">{td('serviceDetails')}</p>
            <div className="space-y-2.5">
              <div>
                <p className="text-xs text-muted-foreground">{td('service')}</p>
                <p className="text-sm font-medium">
                  {Array.isArray(order.services) && order.services.length > 0
                    ? order.services.map(s => {
                        try { return ts(s.type); } catch { return s.type; }
                      }).join(', ')
                    : (() => { try { return ts(order.serviceType); } catch { return order.serviceType; } })()}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-8">
                <div>
                  <p className="text-xs text-muted-foreground">{td('pickup')}</p>
                  <p className="text-sm font-medium">
                    {new Date(order.pickupDate).toLocaleDateString(
                      locale === 'de' ? 'de-DE' : 'en-US'
                    )}
                    {order.pickupTimeSlot && ` - ${order.pickupTimeSlot}`}
                  </p>
                </div>
                {order.deliveryDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">{td('returnDate')}</p>
                    <p className="text-sm font-medium">
                      {new Date(order.deliveryDate).toLocaleDateString(
                        locale === 'de' ? 'de-DE' : 'en-US'
                      )}
                      {order.deliveryTimeSlot && ` - ${order.deliveryTimeSlot}`}
                    </p>
                  </div>
                )}
              </div>
              {order.totalPrice && (
                <div>
                  <p className="text-xs text-muted-foreground">{td('price')}</p>
                  <p className="text-sm font-bold">
                    {parseFloat(order.totalPrice).toFixed(2)} &euro;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.customerNotes && (
            <div className="rounded-xl border border-neutral-200 bg-card p-4 shadow-sm sm:p-5">
              <p className="text-overline mb-2 text-muted-foreground">{td('notes')}</p>
              <p className="text-sm text-foreground">{order.customerNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Jockey Timelines */}
      {order.jockeyAssignments && order.jockeyAssignments.length > 0 && (
        <div className="mb-6 space-y-3">
          {order.jockeyAssignments.map((assignment: any) => (
            <JockeyTimeline key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}

      {/* Extensions section */}
      <div className="mb-6 rounded-xl border border-neutral-200 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-overline text-muted-foreground">{td('extensions')}</p>
          {displayStatus === 'inProgress' && !showExtensionForm && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowExtensionForm(true)}
              className="text-cta"
            >
              {td('newExtension')}
            </Button>
          )}
        </div>

        {order.extensions && order.extensions.length > 0 ? (
          <div className="mt-3 space-y-2">
            {order.extensions.map((ext: any) => (
              <div key={ext.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ext.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {ext.items?.length || 0} {ext.items?.length === 1 ? 'Position' : 'Positionen'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {(typeof ext.totalAmount === 'number' ? ext.totalAmount / 100 : parseFloat(ext.totalAmount)).toFixed(2)} &euro;
                    </p>
                    <span className={`text-xs font-medium ${
                      ext.status === 'APPROVED' ? 'text-success' :
                      ext.status === 'DECLINED' ? 'text-destructive' :
                      'text-cta'
                    }`}>
                      {ext.status === 'APPROVED' ? td('extensionApproved') :
                       ext.status === 'DECLINED' ? td('extensionDeclined') :
                       td('extensionPending')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showExtensionForm && <p className="mt-2 text-xs text-muted-foreground">--</p>
        )}

        {showExtensionForm && (
          <ExtensionForm
            orderId={order.bookingNumber}
            customerName={customerName}
            onSubmit={handleExtensionSubmit}
            onCancel={() => setShowExtensionForm(false)}
          />
        )}
      </div>

      {/* Communication section */}
      <CommunicationSection
        messages={[]}
        onSend={(text) => {
          console.log('Note sent:', text);
          toast.success(td('send'));
        }}
      />
    </div>
  );
}

export default function WorkshopOrderDetailPage() {
  return (
    <ProtectedRoute requiredRole="workshop">
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
