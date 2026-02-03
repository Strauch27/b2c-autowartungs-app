"use client";

import React, { ReactNode } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";

// Load Stripe
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error("Stripe publishable key is not defined");
      return null;
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const stripe = getStripe();

  if (!stripe) {
    // Fallback when Stripe is not configured
    return <>{children}</>;
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        // Default appearance configuration
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
        // Default locale
        locale: "de",
      }}
    >
      {children}
    </Elements>
  );
}

export { getStripe };
