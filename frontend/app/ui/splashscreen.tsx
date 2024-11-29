"use client";
import Image from 'next/image';
import anime from 'animejs';
import { time } from 'console';
import { useEffect, useState } from 'react';

const SplashScreen = () => {
  return (
    <div className="flex h-screen items-center justify-center">
    <div id="testing" className="loading-spinner" style={{ width: '100px', height: '100px' }}>
      <Image src="/loading-spinner.svg" alt="Loading..." layout="fixed" width={100} height={100} objectFit="contain" />
    </div>
    </div>
  );
};

export default SplashScreen;