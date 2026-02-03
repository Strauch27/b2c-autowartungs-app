"use client";

import { useState, useEffect } from "react";
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

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('title')}</h3>

        {extensions.map((extension) => (
          <Card
            key={extension.id}
            className={`${
              extension.status === "PENDING"
                ? "border-yellow-300 bg-yellow-50/50"
                : ""
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {extension.description}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {t('requestedOn')}: {formatDate(extension.createdAt)}
                  </CardDescription>
                </div>
                {getStatusBadge(extension.status, extension.paidAt)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Items List */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('items')}:
                </p>
                <div className="space-y-1">
                  {extension.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm bg-white p-2 rounded border"
                    >
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}€
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              {extension.images && extension.images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {t('images')}: {extension.images.length}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
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
                <span className="font-semibold">{t('totalAmount')}:</span>
                <span className="text-2xl font-bold text-primary flex items-center gap-1">
                  {formatPrice(extension.totalAmount)}
                  <Euro className="w-5 h-5" />
                </span>
              </div>

              {/* Action Button */}
              {extension.status === "PENDING" && (
                <Button
                  onClick={() => handleViewDetails(extension)}
                  className="w-full"
                  variant="default"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {t('viewDetails')}
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
        ))}
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
