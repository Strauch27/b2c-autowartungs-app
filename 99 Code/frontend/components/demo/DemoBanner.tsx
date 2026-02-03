"use client";

import React from "react";

export function DemoBanner() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-400 border-b-4 border-yellow-600 shadow-lg">
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
        </div>
      </div>
    </div>
  );
}
