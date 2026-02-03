"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface PaymentStatusProps {
  paymentIntentId: string;
  onStatusChange?: (status: string) => void;
}

interface PaymentStatusData {
  status: string;
  amount: number;
  currency: string;
  paid: boolean;
}

export function PaymentStatus({
  paymentIntentId,
  onStatusChange,
}: PaymentStatusProps) {
  const [status, setStatus] = useState<PaymentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchPaymentStatus();
  }, [paymentIntentId]);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${apiUrl}/api/payment/status/${paymentIntentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch payment status");
      }

      setStatus(data.data);
      onStatusChange?.(data.data.status);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch payment status";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-gray-600">
            Checking payment status...
          </span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <p className="text-sm">{error}</p>
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case "succeeded":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case "processing":
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case "requires_payment_method":
      case "requires_confirmation":
        return <Clock className="h-6 w-6 text-blue-600" />;
      default:
        return <XCircle className="h-6 w-6 text-red-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case "succeeded":
        return <Badge className="bg-green-600">Paid</Badge>;
      case "processing":
        return <Badge className="bg-yellow-600">Processing</Badge>;
      case "requires_payment_method":
        return <Badge className="bg-blue-600">Awaiting Payment</Badge>;
      case "canceled":
        return <Badge className="bg-gray-600">Cancelled</Badge>;
      default:
        return <Badge className="bg-red-600">Failed</Badge>;
    }
  };

  const getStatusMessage = () => {
    switch (status.status) {
      case "succeeded":
        return "Payment successful! Your booking is confirmed.";
      case "processing":
        return "Your payment is being processed. This may take a few minutes.";
      case "requires_payment_method":
        return "Waiting for payment. Please complete the payment to confirm your booking.";
      case "canceled":
        return "Payment was cancelled.";
      default:
        return "Payment failed. Please try again or contact support.";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold">Payment Status</h3>
              <p className="text-sm text-gray-600">{getStatusMessage()}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Payment Details */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">
              {status.amount.toFixed(2)} {status.currency.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-xs">{paymentIntentId}</span>
          </div>
        </div>

        {/* Retry Button for Failed Payments */}
        {!status.paid && status.status !== "processing" && (
          <button
            onClick={fetchPaymentStatus}
            className="text-sm text-primary hover:underline"
          >
            Refresh Status
          </button>
        )}
      </div>
    </Card>
  );
}
