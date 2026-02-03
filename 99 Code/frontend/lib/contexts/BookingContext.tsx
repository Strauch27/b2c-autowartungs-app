"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { VehicleFormData } from "../validations/vehicle-schema";

interface BookingContextType {
  // Step 1: Vehicle Data
  vehicleData: VehicleFormData | null;
  setVehicleData: (data: VehicleFormData) => void;

  // Step 2: Service Selection
  selectedService: string | null;
  setSelectedService: (service: string) => void;

  // Step 3: Appointment
  appointmentData: AppointmentData | null;
  setAppointmentData: (data: AppointmentData) => void;

  // Navigation
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Reset
  resetBooking: () => void;
}

interface AppointmentData {
  pickupDate: Date;
  pickupTimeSlot: string;
  returnDate: Date;
  pickupAddress: {
    street: string;
    zip: string;
    city: string;
  };
  returnAddress?: {
    street: string;
    zip: string;
    city: string;
  };
  phone: string;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [vehicleData, setVehicleData] = useState<VehicleFormData | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(1);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 3) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const resetBooking = () => {
    setVehicleData(null);
    setSelectedService(null);
    setAppointmentData(null);
    setCurrentStep(1);
  };

  return (
    <BookingContext.Provider
      value={{
        vehicleData,
        setVehicleData,
        selectedService,
        setSelectedService,
        appointmentData,
        setAppointmentData,
        currentStep,
        goToStep,
        nextStep,
        previousStep,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
