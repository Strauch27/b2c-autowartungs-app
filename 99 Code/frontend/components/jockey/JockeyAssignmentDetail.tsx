'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, Car, CheckCircle, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StatusBanner } from './StatusBanner';
import { HandoverChecklist } from './HandoverChecklist';
import { PhotoDocGrid } from './PhotoDocGrid';
import { SignaturePad } from './SignaturePad';
import { AssignmentCardAssignment } from './AssignmentCard';

interface JockeyAssignmentDetailProps {
  assignment: AssignmentCardAssignment;
  onBack: () => void;
  onComplete: (data: {
    photos: string[];
    customerSignature: string;
    notes: string;
  }) => void;
}

export function JockeyAssignmentDetail({
  assignment,
  onBack,
  onComplete,
}: JockeyAssignmentDetailProps) {
  const t = useTranslations('jockeyDashboard.detail');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const isPickup = assignment.type === 'pickup';

  const handleToggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePhotoCapture = (dataUrl: string) => {
    setPhotos((prev) => [...prev, dataUrl]);
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    onComplete({
      photos,
      customerSignature: signature || '',
      notes,
    });
  };

  // Parse vehicle info (format: "Brand Model")
  const vehicleParts = assignment.vehicle.split(' ');
  const vehicleBrand = vehicleParts[0] || '';
  const vehicleModel = vehicleParts.slice(1).join(' ') || '';

  return (
    <div className="min-h-screen bg-neutral-50" data-testid="assignment-detail">
      {/* Back header */}
      <div className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(217,33%,17%)] px-5 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-white p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={t('back')}
          data-testid="detail-back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-base">{t('title')}</h1>
      </div>

      {/* Status banner */}
      <StatusBanner type={assignment.type} status={assignment.status === 'cancelled' ? 'upcoming' : assignment.status} />

      {/* Map placeholder */}
      <div className="mx-5 mt-4" data-testid="map-placeholder">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200">
          <div className="h-36 bg-neutral-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-1" />
              <p className="text-xs text-neutral-400 font-medium">{t('mapPlaceholder')}</p>
            </div>
          </div>
          <div className="px-4 py-2.5 text-xs text-neutral-500 font-medium bg-neutral-50/50">
            {t('estimatedTime', { minutes: '15', km: '8,3' })}
          </div>
        </div>
      </div>

      {/* Customer info */}
      <div className="mx-5 mt-4" data-testid="customer-info">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            {t('customerInfo')}
          </p>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{assignment.customer}</p>
              {assignment.customerPhone && (
                <a
                  href={`tel:${assignment.customerPhone}`}
                  className="flex items-center gap-1 text-xs text-primary font-medium mt-1 hover:underline"
                  data-testid="customer-phone-link"
                >
                  <Phone className="w-3 h-3" />
                  {assignment.customerPhone}
                </a>
              )}
              <div className="flex items-center gap-1 mt-1.5 text-xs text-neutral-500">
                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                <span>{assignment.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle info */}
      <div className="mx-5 mt-4" data-testid="vehicle-info">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            {t('vehicleInfo')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-neutral-400">{t('brand')}</p>
              <p className="text-sm font-medium text-foreground">{vehicleBrand}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400">{t('model')}</p>
              <p className="text-sm font-medium text-foreground">{vehicleModel}</p>
            </div>
            {assignment.licensePlate && (
              <div>
                <p className="text-[10px] text-neutral-400">{t('plate')}</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-neutral-400" />
                  {assignment.licensePlate}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handover section - only for active assignments */}
      {(assignment.status === 'inProgress' || assignment.status === 'atLocation') && (
        <>
          {/* Checklist */}
          <div className="mx-5 mt-4">
            <HandoverChecklist checked={checklist} onToggle={handleToggleChecklist} />
          </div>

          {/* Photo documentation */}
          <div className="mx-5 mt-4">
            <PhotoDocGrid
              photos={photos}
              onCapture={handlePhotoCapture}
              onRemove={handlePhotoRemove}
            />
          </div>

          {/* Signature */}
          <div className="mx-5 mt-4">
            <SignaturePad
              onSignatureChange={setSignature}
              onClear={() => setSignature(null)}
            />
          </div>

          {/* Complete button */}
          <div className="mx-5 mt-6 mb-24">
            <button
              onClick={handleComplete}
              className="w-full py-3.5 bg-success hover:bg-success/90 text-white font-semibold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors min-h-[56px]"
              data-testid="complete-handover-btn"
            >
              <CheckCircle className="w-5 h-5" />
              {isPickup ? t('completePickup') : t('completeReturn')}
            </button>
          </div>
        </>
      )}

      {/* For upcoming/completed assignments, show less */}
      {assignment.status !== 'inProgress' && assignment.status !== 'atLocation' && (
        <div className="h-24" />
      )}
    </div>
  );
}
