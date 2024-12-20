"use client"

import { ReactNode } from "react";
import { redirect } from 'next/navigation';
import { fetchClubByName, fetchNormalUser, switchUsername2Id } from "./backendAPI";
import { jwtDecode } from "jwt-decode";
import { useAuth } from './authContext';

type AuthStateCallback = () => void;
const listeners: AuthStateCallback[] = [];

export function onAuthStateChanged(callback: AuthStateCallback) {
  listeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

export function notifyAuthStateChange() {
  listeners.forEach(callback => callback());
}

export function useIsUserSignedIn() {
  const { isSignedIn } = useAuth();
  return isSignedIn;
}

export const getCurrentUser = async () => {
  try {
    const userType = localStorage.getItem('userType');
    if(userType === 'normal') {
      const userToken = localStorage.getItem('userToken');
      if (!userToken) return null;
      const decodedToken = jwtDecode<{ username: string }>(userToken);
      const userId = await switchUsername2Id(decodedToken.username);
      const user = await fetchNormalUser(userId);
      return user;
    }
    else if(userType === 'club') {
      const userToken = localStorage.getItem('userToken');
      if (!userToken) return null;
      const decodedToken = jwtDecode<{ username: string }>(userToken);
      const user = await fetchClubByName(decodedToken.username);
      return user;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function getUserType() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userType');
  }
  return null;
}

export const ProtectedRoute = ({ children } : Readonly<{children:ReactNode}>) => {
  const { isSignedIn } = useAuth();
  if(!isSignedIn) {
    redirect('/sign-in');
  }
  return children;
}

export const UnprotectedRoute = ({ children } : Readonly<{children:ReactNode}>) => {
  const { isSignedIn } = useAuth();
  if(isSignedIn) {
    return null;
  }
  return children;
}