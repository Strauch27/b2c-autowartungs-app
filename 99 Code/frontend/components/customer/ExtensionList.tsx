"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  Play,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { ExtensionResponse, bookingsApi } from "@/lib/api/bookings";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface ExtensionListProps {
  bookingId: string;
  extensions: ExtensionResponse[];
  onExtensionUpdated?: () => void;
}

export function ExtensionList({
  bookingId,
  extensions,
  onExtensionUpdated,
}: ExtensionListProps) {
  const t = useTranslations('extensions');
  const tApproval = useTranslations('extensionApproval');
  const params = useParams();
  const locale = (params.locale as string) || 'de';

  const getStatusBadge = (status: string, paidAt?: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            {t('pending')}
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="outline" className={paidAt ? "bg-green-50 text-green-700 border-green-300" : "bg-yellow-50 text-yellow-700 border-yellow-300"}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {paidAt ? t('paid') : t('authorized')}
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('completed')}
          </Badge>
        );
      case "DECLINED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            {t('declined')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  if (extensions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t('noExtensions')}</p>
        </CardContent>
      </Card>
    );
  }

  const pendingExtensions = extensions.filter(e => e.status === 'PENDING');
  const otherExtensions = extensions.filter(e => e.status !== 'PENDING');
  const sortedExtensions = [...pendingExtensions, ...otherExtensions];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('title')}</h3>

      {sortedExtensions.map((extension) => {
        const isPending = extension.status === 'PENDING';
        const isApproved = extension.status === 'APPROVED';

        return isPending ? (
          <PendingExtensionCard
            key={extension.id}
            bookingId={bookingId}
            extension={extension}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
            formatPrice={formatPrice}
            t={t}
            tApproval={tApproval}
            onExtensionUpdated={onExtensionUpdated}
          />
        ) : (
          <ReadOnlyExtensionCard
            key={extension.id}
            extension={extension}
            isApproved={isApproved}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
            formatPrice={formatPrice}
            t={t}
          />
        );
      })}
    </div>
  );
}

/** Card for PENDING extensions — inline per-item accept/reject */
function PendingExtensionCard({
  bookingId,
  extension,
  getStatusBadge,
  formatDate,
  formatPrice,
  t,
  tApproval,
  onExtensionUpdated,
}: {
  bookingId: string;
  extension: ExtensionResponse;
  getStatusBadge: (status: string, paidAt?: string) => React.ReactNode;
  formatDate: (d: string) => string;
  formatPrice: (a: number) => string;
  t: ReturnType<typeof useTranslations>;
  tApproval: ReturnType<typeof useTranslations>;
  onExtensionUpdated?: () => void;
}) {
  const items = Array.isArray(extension.items) ? extension.items : [];
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(
    () => new Set(items.map((_, i) => i))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const selectedTotal = useMemo(() => {
    return items.reduce((sum, item, index) => {
      if (acceptedIndices.has(index)) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
  }, [items, acceptedIndices]);

  const toggleItem = (index: number) => {
    setAcceptedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handlePaySelected = async () => {
    if (acceptedIndices.size === 0) return;
    try {
      setIsSubmitting(true);
      await bookingsApi.respondToExtension(
        bookingId,
        extension.id,
        Array.from(acceptedIndices)
      );
      toast.success(tApproval('approveSuccess'));
      onExtensionUpdated?.();
    } catch (error) {
      console.error("Error responding to extension:", error);
      toast.error(tApproval('approveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineAll = async () => {
    try {
      setIsDeclining(true);
      await bookingsApi.respondToExtension(bookingId, extension.id, []);
      toast.success(tApproval('declineSuccess'));
      onExtensionUpdated?.();
    } catch (error) {
      console.error("Error declining extension:", error);
      toast.error(tApproval('declineError'));
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <Card className="border-2 border-amber-400 bg-amber-50/70 shadow-md">
      {/* Alert header */}
      <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 rounded-t-lg flex items-center gap-3">
        <div className="flex-shrink-0 bg-amber-500 rounded-full p-1.5">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-amber-900">{t('approvalRequired')}</p>
          <p className="text-sm text-amber-800">{t('approvalRequiredDesc')}</p>
        </div>
      </div>

      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-base">{extension.description}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate">{t('requestedOn')}: {formatDate(extension.createdAt)}</span>
            </CardDescription>
          </div>
          {getStatusBadge(extension.status, extension.paidAt)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6">
        {/* Items with inline accept/reject toggles */}
        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t('items')}:
            </p>
            <div className="space-y-2">
              {items.map((item, index) => {
                const isAccepted = acceptedIndices.has(index);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 text-sm bg-white p-3 rounded-lg border-2 transition-all ${
                      isAccepted
                        ? 'border-green-300 bg-green-50/30'
                        : 'border-red-200 bg-red-50/30 opacity-70'
                    }`}
                  >
                    {/* Per-item media thumbnail */}
                    {item.mediaUrl && (
                      item.mediaType === 'video' ? (
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Play className="h-5 w-5 text-neutral-500" />
                        </div>
                      ) : (
                        <img
                          src={item.mediaUrl}
                          alt=""
                          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                        />
                      )
                    )}

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${!isAccepted ? 'line-through text-muted-foreground' : ''}`}>
                        {item.quantity}x {item.name}
                      </p>
                      <p className={`text-sm ${!isAccepted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {formatPrice(item.price * item.quantity)} EUR
                      </p>
                    </div>

                    {/* Accept / Reject toggle buttons */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => { if (!isAccepted) toggleItem(index); }}
                        className={`rounded-lg p-2 transition-all ${
                          isAccepted
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-neutral-100 text-neutral-400 hover:bg-green-100 hover:text-green-600'
                        }`}
                        title={t('itemAccepted')}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (isAccepted) toggleItem(index); }}
                        className={`rounded-lg p-2 transition-all ${
                          !isAccepted
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-neutral-100 text-neutral-400 hover:bg-red-100 hover:text-red-600'
                        }`}
                        title={t('itemRejected')}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Extension-level images (legacy) */}
        {Array.isArray(extension.images) && extension.images.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {t('images')}: {extension.images.length}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {extension.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={image} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Total */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="font-bold">
            {acceptedIndices.size < items.length ? tApproval('selectedTotal') : t('totalAmount')}:
          </span>
          <span className={`text-2xl font-bold ${acceptedIndices.size > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            {formatPrice(selectedTotal)} EUR
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDeclineAll}
            disabled={isSubmitting || isDeclining}
            className="text-destructive hover:text-destructive min-h-[48px] sm:w-auto"
            size="lg"
          >
            {isDeclining ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            {tApproval('declineAll')}
          </Button>
          <Button
            onClick={handlePaySelected}
            disabled={isSubmitting || isDeclining || acceptedIndices.size === 0}
            className="flex-1 min-h-[48px] bg-green-600 hover:bg-green-700 text-white text-base"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {tApproval('processing')}
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                {tApproval('paySelectedItems')} ({formatPrice(selectedTotal)} EUR)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Read-only card for non-PENDING extensions (APPROVED, COMPLETED, DECLINED) */
function ReadOnlyExtensionCard({
  extension,
  isApproved,
  getStatusBadge,
  formatDate,
  formatPrice,
  t,
}: {
  extension: ExtensionResponse;
  isApproved: boolean;
  getStatusBadge: (status: string, paidAt?: string) => React.ReactNode;
  formatDate: (d: string) => string;
  formatPrice: (a: number) => string;
  t: ReturnType<typeof useTranslations>;
}) {
  const items = Array.isArray(extension.items) ? extension.items : [];

  return (
    <Card className={isApproved ? "border-2 border-green-300 bg-green-50/50" : ""}>
      {/* Green success header for APPROVED */}
      {isApproved && (
        <div className="bg-green-100 border-b border-green-300 px-4 py-3 rounded-t-lg flex items-center gap-3">
          <div className="flex-shrink-0 bg-green-500 rounded-full p-1.5">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-900">{t('extensionApproved')}</p>
          </div>
        </div>
      )}

      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-base">{extension.description}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate">{t('requestedOn')}: {formatDate(extension.createdAt)}</span>
            </CardDescription>
          </div>
          {getStatusBadge(extension.status, extension.paidAt)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6">
        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{t('items')}:</p>
            <div className="space-y-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-sm bg-white p-2 rounded border ${
                    item.accepted === false ? 'opacity-50 line-through' : ''
                  }`}
                >
                  {item.mediaUrl && (
                    item.mediaType === 'video' ? (
                      <div className="h-10 w-10 flex-shrink-0 rounded bg-neutral-100 flex items-center justify-center">
                        <Play className="h-4 w-4 text-neutral-500" />
                      </div>
                    ) : (
                      <img src={item.mediaUrl} alt="" className="h-10 w-10 flex-shrink-0 rounded object-cover" />
                    )
                  )}
                  <span className="flex-1">{item.quantity}x {item.name}</span>
                  {item.accepted === true && (
                    <span className="flex items-center gap-0.5 text-xs text-green-600">
                      <Check className="h-3 w-3" /> {t('itemAccepted')}
                    </span>
                  )}
                  {item.accepted === false && (
                    <span className="flex items-center gap-0.5 text-xs text-red-500">
                      <X className="h-3 w-3" /> {t('itemRejected')}
                    </span>
                  )}
                  <span className="font-medium">{formatPrice(item.price * item.quantity)} EUR</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(extension.images) && extension.images.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {t('images')}: {extension.images.length}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {extension.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={image} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="font-bold">{t('totalAmount')}:</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(extension.totalAmount)} EUR</span>
        </div>

        {extension.approvedAt && !extension.paidAt && (
          <p className="text-xs text-muted-foreground text-center">{t('approvedOn')}: {formatDate(extension.approvedAt)}</p>
        )}
        {extension.paidAt && (
          <p className="text-xs text-green-600 font-medium text-center">{t('paidOn')}: {formatDate(extension.paidAt)}</p>
        )}
        {extension.declinedAt && (
          <p className="text-xs text-muted-foreground text-center">{t('declinedOn')}: {formatDate(extension.declinedAt)}</p>
        )}
      </CardContent>
    </Card>
  );
}
