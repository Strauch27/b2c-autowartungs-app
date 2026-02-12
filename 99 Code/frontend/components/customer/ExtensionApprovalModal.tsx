"use client";

import { useState, useMemo, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  CreditCard,
  Lock,
  Play,
} from "lucide-react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/contexts/StripeContext";
import { ExtensionResponse, bookingsApi } from "@/lib/api/bookings";
import { DemoPaymentForm } from "@/components/payment/demo-payment-form";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface ExtensionApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  extension: ExtensionResponse;
  onApproved: () => void;
  onDeclined: () => void;
}

type ModalView = "review" | "payment" | "decline";

// Payment form component (needs to be separate to use Stripe hooks)
function PaymentForm({
  amount,
  onSuccess,
  onCancel,
}: {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations('extensionApproval');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: window.location.href,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Payment authorization failed");
        toast.error(error.message || "Payment authorization failed");
      } else if (paymentIntent) {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg bg-muted p-4">
        <h4 className="font-semibold mb-2">{t('paymentTitle')}</h4>
        <p className="text-sm text-muted-foreground">{t('paymentDescription')}</p>
      </div>

      <div className="border rounded-lg p-4">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "sepa_debit"],
          }}
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{t('authorizedAmount')}:</span>
          <span className="text-2xl font-bold text-primary">
            {(amount / 100).toFixed(2)} EUR
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 min-h-[48px]"
          size="lg"
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="flex-1 min-h-[48px]"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t('processing')}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              {t('authorize')}
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>{t('securityNotice')}</span>
      </div>
    </form>
  );
}

export function ExtensionApprovalModal({
  open,
  onOpenChange,
  bookingId,
  extension,
  onApproved,
  onDeclined,
}: ExtensionApprovalModalProps) {
  const t = useTranslations('extensionApproval');
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const [currentView, setCurrentView] = useState<ModalView>("review");
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | null>(null);

  // Per-item acceptance state — all items checked by default
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(
    () => new Set(extension.items.map((_, i) => i))
  );

  // Payment state
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  // Calculate dynamic total from accepted items
  const selectedTotal = useMemo(() => {
    return extension.items.reduce((sum, item, index) => {
      if (acceptedIndices.has(index)) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
  }, [extension.items, acceptedIndices]);

  const isDemoMode = !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
                     process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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

  const handlePaySelectedItems = async () => {
    if (acceptedIndices.size === 0) return;

    try {
      setIsSubmitting(true);

      // Call the respond endpoint with accepted item indices
      const result = await bookingsApi.respondToExtension(
        bookingId,
        extension.id,
        Array.from(acceptedIndices)
      );

      if (isDemoMode) {
        // In demo mode, payment is auto-confirmed by the backend
        toast.success(t('approveSuccess'));
        onApproved();
        handleClose();
      } else if (result.paymentIntent?.clientSecret) {
        // In Stripe mode, need to complete payment
        setClientSecret(result.paymentIntent.clientSecret);
        setCurrentView("payment");
      }
    } catch (error) {
      console.error("Error responding to extension:", error);
      toast.error(t('approveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      toast.success(t('approveSuccess'));
      onApproved();
      handleClose();
    } catch (error) {
      console.error("Error after payment:", error);
      toast.error(t('approveError'));
    }
  };

  const handleDeclineAll = () => {
    setCurrentView("decline");
  };

  const handleDecline = async () => {
    try {
      setIsDeclining(true);

      // Respond with empty accepted items = decline all
      await bookingsApi.respondToExtension(
        bookingId,
        extension.id,
        []
      );

      toast.success(t('declineSuccess'));
      onDeclined();
      handleClose();
    } catch (error) {
      console.error("Error declining extension:", error);
      toast.error(t('declineError'));
    } finally {
      setIsDeclining(false);
    }
  };

  const handleClose = () => {
    setCurrentView("review");
    setDeclineReason("");
    setClientSecret("");
    setAcceptedIndices(new Set(extension.items.map((_, i) => i)));
    onOpenChange(false);
  };

  const handleCancelDecline = () => {
    setCurrentView("review");
    setDeclineReason("");
  };

  const handleCancelPayment = () => {
    setCurrentView("review");
    setClientSecret("");
  };

  const stripePromise = getStripe();

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              {t('reviewTitle')}
            </DialogTitle>
            <DialogDescription>{t('selectItems')}</DialogDescription>
          </DialogHeader>

          {/* Review View - Per-item toggles */}
          {currentView === "review" && (
            <>
              <div className="space-y-6">
                {/* Description */}
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">{extension.description}</p>
                </div>

                {/* Items List with checkboxes */}
                <div className="space-y-3">
                  <Label className="text-base">{t('items')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('itemsSelected').replace('{count}', acceptedIndices.size.toString()).replace('{total}', extension.items.length.toString())}
                  </p>
                  <div className="space-y-2">
                    {extension.items.map((item, index) => {
                      const isAccepted = acceptedIndices.has(index);
                      return (
                        <div
                          key={index}
                          onClick={() => toggleItem(index)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isAccepted
                              ? 'border-green-300 bg-green-50/50'
                              : 'border-neutral-200 bg-neutral-50 opacity-60'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isAccepted
                              ? 'bg-green-500 border-green-500'
                              : 'border-neutral-300 bg-white'
                          }`}>
                            {isAccepted && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                          </div>

                          {/* Per-item media thumbnail */}
                          {item.mediaUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMediaUrl(item.mediaUrl!);
                                setSelectedMediaType(item.mediaType || 'image');
                              }}
                              className="flex-shrink-0"
                            >
                              {item.mediaType === 'video' ? (
                                <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                                  <Play className="h-5 w-5 text-neutral-500" />
                                </div>
                              ) : (
                                <img
                                  src={item.mediaUrl}
                                  alt=""
                                  className="h-12 w-12 rounded-lg object-cover hover:opacity-80 transition-opacity"
                                />
                              )}
                            </button>
                          )}

                          {/* Item details */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${!isAccepted ? 'line-through' : ''}`}>
                              {item.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity}x @ {formatPrice(item.price)} EUR
                            </p>
                          </div>

                          {/* Item total */}
                          <span className={`text-lg font-bold whitespace-nowrap ${!isAccepted ? 'line-through text-muted-foreground' : ''}`}>
                            {formatPrice(item.price * item.quantity)} EUR
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Extension-level images (legacy) */}
                {extension.images && extension.images.length > 0 && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base">
                      <ImageIcon className="h-4 w-4" />
                      {t('images')}
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {extension.images.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedMediaUrl(image);
                            setSelectedMediaType('image');
                          }}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-muted"
                        >
                          <img
                            src={image}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Total */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{t('selectedTotal')}:</span>
                    <span className={`text-2xl font-bold ${acceptedIndices.size > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {formatPrice(selectedTotal)} EUR
                    </span>
                  </div>
                  {acceptedIndices.size === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">{t('noItemsSelected')}</p>
                  )}
                </div>

                {/* Warning */}
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 mb-1">{t('warning')}</p>
                      <p className="text-sm text-yellow-800">{t('warningText')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleDeclineAll}
                  disabled={isSubmitting}
                  className="text-destructive hover:text-destructive min-h-[48px] w-full sm:w-auto"
                  size="lg"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  {t('declineAll')}
                </Button>
                <Button
                  onClick={handlePaySelectedItems}
                  disabled={isSubmitting || acceptedIndices.size === 0}
                  className="flex-1 min-h-[48px]"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {t('paySelectedItems')} ({formatPrice(selectedTotal)} EUR)
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Payment View - Demo Mode or Stripe */}
          {currentView === "payment" && (
            <>
              {isDemoMode ? (
                <DemoPaymentForm
                  amount={selectedTotal / 100}
                  extensionId={extension.id}
                  type="extension"
                  onSuccess={() => {
                    toast.success(t('approveSuccess'));
                    onApproved();
                    handleClose();
                  }}
                  onError={(error) => {
                    toast.error(error);
                  }}
                />
              ) : clientSecret && stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#0070f3",
                        colorBackground: "#ffffff",
                        colorText: "#1a1a1a",
                        colorDanger: "#ef4444",
                        fontFamily: "system-ui, sans-serif",
                        borderRadius: "8px",
                      },
                    },
                    locale: locale === "de" ? "de" : "en",
                  }}
                >
                  <PaymentForm
                    amount={selectedTotal}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handleCancelPayment}
                  />
                </Elements>
              ) : null}
            </>
          )}

          {/* Decline View */}
          {currentView === "decline" && (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <Label htmlFor="decline-reason" className="text-base mb-2 block">
                    {t('declineReasonLabel')}
                  </Label>
                  <Textarea
                    id="decline-reason"
                    placeholder={t('declineReasonPlaceholder')}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={4}
                    className="bg-white"
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelDecline}
                  disabled={isDeclining}
                  className="min-h-[48px] w-full sm:w-auto"
                  size="lg"
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDecline}
                  disabled={isDeclining}
                  className="flex-1 min-h-[48px]"
                  size="lg"
                >
                  {isDeclining ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('declining')}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      {t('confirmDecline')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Viewer Dialog */}
      {selectedMediaUrl && (
        <Dialog
          open={selectedMediaUrl !== null}
          onOpenChange={() => {
            setSelectedMediaUrl(null);
            setSelectedMediaType(null);
          }}
        >
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl">
            {selectedMediaType === 'video' ? (
              <video
                src={selectedMediaUrl}
                controls
                autoPlay
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <img
                src={selectedMediaUrl}
                alt="Evidence"
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
