'use client';

import { cn } from '@/lib/utils';

interface PillTab {
  id: string;
  label: string;
  badge?: number;
}

interface PillTabsProps {
  tabs: PillTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function PillTabs({ tabs, activeTab, onTabChange }: PillTabsProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-full p-1 mb-4 animate-card">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-full text-center transition-all duration-200 relative',
            activeTab === tab.id
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-200'
          )}
          data-testid={`subtab-${tab.id}`}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              data-testid="extension-count-badge"
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
