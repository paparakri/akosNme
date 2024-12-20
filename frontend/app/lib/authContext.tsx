"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isSignedIn: boolean;
  updateAuthStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  updateAuthStatus: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    setIsSignedIn(!!userToken);
  }, []);

  const updateAuthStatus = (status: boolean) => {
    setIsSignedIn(status);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, updateAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);