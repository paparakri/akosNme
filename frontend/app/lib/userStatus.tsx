"use client"
import { ReactNode } from "react";
import { redirect } from 'next/navigation';

import { useState, useEffect } from 'react';


export function useIsUserSignedIn() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    setIsSignedIn(userToken !== null);
  }, []);

  return isSignedIn;
}

export function getUserType() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userType');
  }
  return null;
}

export const ProtectedRoute = ({ children } : Readonly<{children:ReactNode}>) => {
    const status = useIsUserSignedIn();
    if(!status){
        redirect('/sing-up');
    } else {
        return children;
    }
}

export const UnprotectedRoute = ({ children } : Readonly<{children:ReactNode}>) => {
    const status = useIsUserSignedIn();
    if(status){
        return <></>;
    } else {
        return children;
    }
}