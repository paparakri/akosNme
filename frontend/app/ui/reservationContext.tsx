"use client";

import React, { createContext, useContext, useState } from 'react';

interface ReservationContextType {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <ReservationContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}