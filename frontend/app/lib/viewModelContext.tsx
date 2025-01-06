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
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Initialize from localStorage if available, otherwise default to 'club'
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('viewMode') as ViewMode;
      return storedMode || 'club';
    }
    return 'club';
  });
  const [isClub, setIsClub] = useState(false);
  const router = useRouter();

  // Initial setup based on user type
  useEffect(() => {
    const userType = getUserType();
    if (userType === 'normal') {
      setViewMode('guest');
      setIsClub(false);
      localStorage.removeItem('viewMode'); // Clear stored mode for normal users
    } else if (userType === 'club') {
      setIsClub(true);
      // Only set viewMode if there's no stored preference
      const storedMode = localStorage.getItem('viewMode');
      if (!storedMode) {
        setViewMode('club');
        localStorage.setItem('viewMode', 'club');
      }
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(() => {
      const userType = getUserType();
      if (userType === 'club') {
        setIsClub(true);
        // Maintain the stored view mode preference
        const storedMode = localStorage.getItem('viewMode') as ViewMode;
        if (storedMode) {
          setViewMode(storedMode);
        }
      } else {
        setIsClub(false);
        setViewMode('guest');
        localStorage.removeItem('viewMode');
      }
    });

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