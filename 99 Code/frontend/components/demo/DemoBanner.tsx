"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "demo-banner-dismissed";

export function DemoBanner() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  if (!isDemoMode || isDismissed) {
    return null;
  }

  return (
    <div className="relative z-50 bg-yellow-400 border-b-4 border-yellow-600 shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center space-x-3">
          <span className="text-2xl" role="img" aria-label="Theater masks">
            🎭
          </span>
          <div className="text-center">
            <p className="text-sm font-bold text-yellow-900 uppercase tracking-wide">
              Demo Mode Active
            </p>
            <p className="text-xs text-yellow-800">
              This is a demonstration environment - no real payments will be processed
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 p-1 rounded-full hover:bg-yellow-500 transition-colors"
            aria-label="Dismiss demo banner"
          >
            <X className="h-4 w-4 text-yellow-900" />
          </button>
        </div>
      </div>
    </div>
  );
}
