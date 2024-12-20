'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserType } from './userStatus';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from './userStatus';

type ViewMode = 'club' | 'guest';

interface ViewModeContextType {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  isClub: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('club');
  const [isClub, setIsClub] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(() => {
      const userType = getUserType();
      const storedMode = localStorage.getItem('viewMode') as ViewMode;
      
      if (userType === 'club') {
        setIsClub(true);
        setViewMode(storedMode || 'club');
      } else {
        setIsClub(false);
        setViewMode('guest');
        localStorage.removeItem('viewMode');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const toggleViewMode = () => {
    const userType = getUserType();
    if (userType === 'club') {
      const newMode = viewMode === 'club' ? 'guest' : 'club';
      setViewMode(newMode);
      localStorage.setItem('viewMode', newMode);
      router.push('/');
    }
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, toggleViewMode, isClub }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}