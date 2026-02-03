"use client";

import { useState, FormEvent } from "react";
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
  Euro,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  CreditCard,
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
  extension,
  onSuccess,
  onCancel,
}: {
  extension: ExtensionResponse;
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
      // Confirm the payment (authorization only, not capture)
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
        // Payment authorized successfully
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="bg-primary/10 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{t('authorizedAmount')}:</span>
          <span className="text-3xl font-bold text-primary flex items-center gap-1">
            {(extension.totalAmount / 100).toFixed(2)}
            <Euro className="w-6 h-6" />
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('processing')}
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {t('authorize')}
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">{t('securityNotice')}</p>
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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Payment state
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isApprovingExtension, setIsApprovingExtension] = useState(false);

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  // Check if we're in demo mode (no Stripe key or DEMO_MODE=true)
  const isDemoMode = !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
                     process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const handleApproveClick = async () => {
    // In demo mode, skip payment creation and go directly to approval
    if (isDemoMode) {
      setCurrentView("payment");
      return;
    }

    try {
      setIsLoadingPayment(true);

      // Step 1: Create payment authorization (Stripe)
      const paymentData = await bookingsApi.authorizeExtensionPayment(extension.id);

      setClientSecret(paymentData.clientSecret);
      setCurrentView("payment");
    } catch (error) {
      console.error("Error creating payment authorization:", error);
      toast.error(t('approveError'));
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setIsApprovingExtension(true);

      // Step 2: Approve extension with payment intent ID
      await bookingsApi.approveExtension(extension.id, paymentIntentId);

      toast.success(t('approveSuccess'));
      onApproved();
      handleClose();
    } catch (error) {
      console.error("Error approving extension:", error);
      toast.error(t('approveError'));
    } finally {
      setIsApprovingExtension(false);
    }
  };

  const handleDeclineClick = () => {
    setCurrentView("decline");
  };

  const handleDecline = async () => {
    try {
      setIsDeclining(true);

      await bookingsApi.declineExtension(
        extension.id,
        declineReason || undefined
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              {t('reviewTitle')}
            </DialogTitle>
            <DialogDescription>{t('reviewDescription')}</DialogDescription>
          </DialogHeader>

          {/* Review View */}
          {currentView === "review" && (
            <>
              <div className="space-y-6">
                {/* Description */}
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">{extension.description}</p>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <Label className="text-base">{t('items')}</Label>
                  <div className="space-y-2">
                    {extension.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x à {formatPrice(item.price)}€
                          </p>
                        </div>
                        <span className="text-lg font-bold">
                          {formatPrice(item.price * item.quantity)}€
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
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
                          onClick={() => setSelectedImageIndex(index)}
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

                {/* Total Amount */}
                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{t('totalAmount')}:</span>
                    <span className="text-3xl font-bold text-primary flex items-center gap-1">
                      {formatPrice(extension.totalAmount)}
                      <Euro className="w-6 h-6" />
                    </span>
                  </div>
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

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleDeclineClick}
                  disabled={isLoadingPayment}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('decline')}
                </Button>
                <Button
                  onClick={handleApproveClick}
                  disabled={isLoadingPayment}
                  className="flex-1"
                >
                  {isLoadingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('loadingPayment')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('approveAndPay')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Payment View */}
          {/* Payment View - Demo Mode or Stripe */}
          {currentView === "payment" && (
            <>
              {isDemoMode ? (
                // Demo Mode Payment
                <DemoPaymentForm
                  amount={extension.totalAmount / 100}
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
                // Stripe Payment
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
                  {isApprovingExtension ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-lg font-medium">{t('approvingExtension')}</p>
                    </div>
                  ) : (
                    <PaymentForm
                      extension={extension}
                      onSuccess={handlePaymentSuccess}
                      onCancel={handleCancelPayment}
                    />
                  )}
            </Elements>
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

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelDecline}
                  disabled={isDeclining}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDecline}
                  disabled={isDeclining}
                  className="flex-1"
                >
                  {isDeclining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('declining')}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      {t('confirmDecline')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      {selectedImageIndex !== null && extension.images && (
        <Dialog
          open={selectedImageIndex !== null}
          onOpenChange={() => setSelectedImageIndex(null)}
        >
          <DialogContent className="max-w-4xl">
            <img
              src={extension.images[selectedImageIndex]}
              alt={`Evidence ${selectedImageIndex + 1}`}
              className="w-full h-auto rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
