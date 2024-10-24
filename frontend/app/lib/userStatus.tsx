"use client"
import { ReactNode } from "react";
import { redirect } from 'next/navigation';

import { useState, useEffect } from 'react';
import { fetchClubByName, fetchNormalUser, switchUsername2Id } from "./backendAPI";
import { jwtDecode } from "jwt-decode";


export function useIsUserSignedIn() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    setIsSignedIn(userToken !== null);
  }, []);

  return isSignedIn;
}

export const getCurrentUser = async () => {
  console.log(`getCurrentUser called`);
  try{
    const userType = localStorage.getItem('userType');
    if(userType === 'normal'){
      const userToken = localStorage.getItem('userToken');
      if (!userToken) return null;
      const decodedToken = jwtDecode<{ username: string }>(userToken);
      const userId = switchUsername2Id(decodedToken.username);
      const user = await fetchNormalUser(await userId);
      return user;
    }
    else if(userType === 'club'){
      const userToken = localStorage.getItem('userToken');
      if (!userToken) return null;
      const decodedToken = jwtDecode<{ username: string }>(userToken);
      const user = fetchClubByName(decodedToken.username);
      console.log(`user: ${user}`);
      return user;
    }
    
  } catch (error) {
    // Handle the error
    console.error(error);
  }
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