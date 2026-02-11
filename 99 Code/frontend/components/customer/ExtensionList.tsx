"use client";

import { useState } from "react";
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
  Euro,
  Image as ImageIcon,
} from "lucide-react";
import { ExtensionResponse } from "@/lib/api/bookings";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ExtensionApprovalModal } from "./ExtensionApprovalModal";

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
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const [selectedExtension, setSelectedExtension] = useState<ExtensionResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleViewDetails = (extension: ExtensionResponse) => {
    setSelectedExtension(extension);
    setIsModalOpen(true);
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
  // Show pending first, then others
  const sortedExtensions = [...pendingExtensions, ...otherExtensions];

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('title')}</h3>

        {sortedExtensions.map((extension) => {
          const isPending = extension.status === 'PENDING';
          const isApproved = extension.status === 'APPROVED';
          const items = Array.isArray(extension.items) ? extension.items : [];

          return (
            <Card
              key={extension.id}
              className={
                isPending
                  ? "border-2 border-amber-400 bg-amber-50/70 shadow-md"
                  : isApproved
                  ? "border-2 border-green-300 bg-green-50/50"
                  : ""
              }
            >
              {/* Prominent alert header for PENDING extensions */}
              {isPending && (
                <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 rounded-t-lg flex items-center gap-3">
                  <div className="flex-shrink-0 bg-amber-500 rounded-full p-1.5">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900">{t('approvalRequired')}</p>
                    <p className="text-sm text-amber-800">{t('approvalRequiredDesc')}</p>
                  </div>
                </div>
              )}

              {/* Green success header for APPROVED extensions */}
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
                    <CardTitle className="text-base">
                      {extension.description}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">{t('requestedOn')}: {formatDate(extension.createdAt)}</span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(extension.status, extension.paidAt)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 px-4 sm:px-6">
                {/* Items List - with defensive guard */}
                {items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('items')}:
                    </p>
                    <div className="space-y-1">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm bg-white p-2 rounded border"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium">
                            {formatPrice(item.price * item.quantity)} EUR
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images */}
                {Array.isArray(extension.images) && extension.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      {t('images')}: {extension.images.length}
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {extension.images.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                        >
                          <img
                            src={image}
                            alt={`Extension evidence ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-bold">{t('totalAmount')}:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(extension.totalAmount)} EUR
                  </span>
                </div>

                {/* Action Button - prominent for PENDING */}
                {isPending && (
                  <Button
                    onClick={() => handleViewDetails(extension)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white text-base py-6"
                    size="lg"
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {t('approveAndPay')}
                  </Button>
                )}

                {/* Approval/Decline/Paid Date */}
                {extension.approvedAt && !extension.paidAt && (
                  <p className="text-xs text-muted-foreground text-center">
                    {t('approvedOn')}: {formatDate(extension.approvedAt)}
                  </p>
                )}
                {extension.paidAt && (
                  <p className="text-xs text-green-600 font-medium text-center">
                    {t('paidOn')}: {formatDate(extension.paidAt)}
                  </p>
                )}
                {extension.declinedAt && (
                  <p className="text-xs text-muted-foreground text-center">
                    {t('declinedOn')}: {formatDate(extension.declinedAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Extension Approval Modal */}
      {selectedExtension && (
        <ExtensionApprovalModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          bookingId={bookingId}
          extension={selectedExtension}
          onApproved={() => {
            setIsModalOpen(false);
            onExtensionUpdated?.();
          }}
          onDeclined={() => {
            setIsModalOpen(false);
            onExtensionUpdated?.();
          }}
        />
      )}
    </>
  );
}
