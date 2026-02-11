'use client';

import { useTranslations } from 'next-intl';

interface ChecklistItem {
  key: string;
  label: string;
}

interface HandoverChecklistProps {
  items?: ChecklistItem[];
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}

export function HandoverChecklist({ items, checked, onToggle }: HandoverChecklistProps) {
  const t = useTranslations('jockeyDashboard.detail');

  const defaultItems: ChecklistItem[] = [
    { key: 'vehicleReceived', label: t('checkVehicleReceived') },
    { key: 'conditionDocumented', label: t('checkConditionDocumented') },
    { key: 'keysReceived', label: t('checkKeysReceived') },
    { key: 'mileageRecorded', label: t('checkMileageRecorded') },
    { key: 'customerSignature', label: t('checkCustomerSignature') },
  ];

  const checklistItems = items || defaultItems;

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200"
      data-testid="handover-checklist"
    >
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
        {t('handoverChecklist')}
      </p>
      <div className="space-y-1">
        {checklistItems.map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer min-h-[48px] py-1">
            <input
              type="checkbox"
              checked={!!checked[item.key]}
              onChange={() => onToggle(item.key)}
              className="w-6 h-6 rounded border-neutral-300 text-success accent-[hsl(var(--success))] shrink-0"
              data-testid={`checklist-${item.key}`}
            />
            <span
              className={`text-sm transition-all ${
                checked[item.key] ? 'line-through text-neutral-400' : 'text-foreground'
              }`}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
