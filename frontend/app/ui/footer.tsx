'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const footerLinks = {
    about: [
      { label: 'About Us', href: '/about' },
      { label: 'Features', href: '/features' },
      { label: 'Careers', href: '/careers' },
      { label: 'News', href: '/news' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Safety', href: '/safety' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
    business: [
      { label: 'For Club Owners', href: '/club-owners' },
      { label: 'Advertising', href: '/advertising' },
      { label: 'Partnerships', href: '/partnerships' },
      { label: 'Success Stories', href: '/success-stories' },
    ],
  };

  return (
    <footer className="relative mt-16">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black to-black pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand section */}
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Pulse
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Experience the best of nightlife. Book tables, discover events, and connect with the vibrant community of night owls around you.
            </p>
            {/* Social links */}
            <div className="flex space-x-4">
            </div>
          </div>

          {/* Links sections */}
          <FooterLinkSection title="About" links={footerLinks.about} />
          <FooterLinkSection title="Support" links={footerLinks.support} />
          <FooterLinkSection title="Business" links={footerLinks.business} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Pulse. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper Components
const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 
               hover:bg-white/10 hover:text-white transition-all duration-200 
               hover:scale-110 active:scale-95"
  >
    {icon}
  </a>
);

const FooterLinkSection = ({ title, links }: { title: string; links: { label: string; href: string }[] }) => (
  <div className="space-y-6">
    <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
      {title}
    </h3>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link.label}>
          <Link 
            href={link.href}
            className="text-gray-400 hover:text-white text-sm transition-all duration-200 
                       hover:translate-x-1 inline-block"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;