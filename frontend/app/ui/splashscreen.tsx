"use client";
import Image from 'next/image';
import anime from 'animejs';
import { time } from 'console';
import { useEffect, useState } from 'react';

const SplashScreen = () => {
  const [isMounted, setIsMounted] = useState(false);

  const animate = () => {
    anime({
      targets: '#testing',
      scale: [
        { value: 1, duration: 0 },
        { value: 1.5, duration: 300, easing: 'easeInOutExpo' },
        { value: 1, duration: 300, easing: 'easeInOutExpo' },
        { value: 1.5, duration: 300, easing: 'easeInOutExpo' },
        { value: 1, duration: 300, easing: 'easeInOutExpo' }
      ],
      loop: true,
      direction: 'alternate'
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 10);
    animate();
    return () => clearTimeout(timeout);
  });

  return (
    <div className="flex h-screen items-center justify-center">
        <Image id='testing' src={"/CallToActionIllustration.png"} alt='Loader' width={150} height={150} />
    </div>
  );
};

export default SplashScreen;