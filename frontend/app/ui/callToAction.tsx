"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const customBreak = {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
  };

export default function CallToActionWithIllustration() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background video effect */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(45deg, #000 0%, #1a1a1a 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite'
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Animated light beams */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-48">
        <div className={`space-y-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Main heading */}
          <h1 className="text-center">
            <span className="block text-gray-200 text-sm font-semibold tracking-wide uppercase mb-3">
              Welcome to the Future of Nightlife
            </span>
            <span className="block text-white text-4xl sm:text-6xl lg:text-7xl font-bold leading-none tracking-tight mb-4">
              Your Night.
            </span>
            <span className="block text-purple-900 text-4xl sm:text-6xl lg:text-7xl font-bold leading-none tracking-tight">
              Your Way.
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-center text-xl text-gray-300">
            Skip the hassle. Reserve the best tables at the hottest clubs in town with just a few taps.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-8">
            <button
              onClick={() => router.push('/sign-up')}
              className="px-8 py-4 bg-gradient-to-r from-purple-700 to-purple-900 text-white font-semibold rounded-full 
                         transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:from-purple-800 hover:to-purple-900
                         focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/about-us')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full
                         transform transition-all duration-300 hover:bg-white hover:text-black hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              Learn More
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: 'Instant Booking',
                description: 'Reserve your spot in seconds',
                icon: '🎉'
              },
              {
                title: 'VIP Treatment',
                description: 'Skip the line, every time',
                icon: '⭐'
              },
              {
                title: 'Exclusive Deals',
                description: 'Special offers just for you',
                icon: '💎'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="relative p-6 bg-white/10 rounded-2xl backdrop-blur-sm
                           transform transition-all duration-300 hover:scale-105 hover:bg-white/15"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}