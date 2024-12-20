// app/(club)/dashboard/layout.tsx
"use client";

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Settings as SettingsIcon,
  TableProperties,
  Menu as MenuIcon,
  X,
  Calendar
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { fetchClubByName } from '@/app/lib/backendAPI';

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    href: '/dashboard'
  },
  { 
    icon: Calendar, 
    label: 'Reservations', 
    href: '/dashboard/reservations'
  },
  { 
    icon: TableProperties, 
    label: 'Tables', 
    href: '/dashboard/tables'
  },
  { 
    icon: CalendarDays, 
    label: 'Events', 
    href: '/dashboard/events'
  },
  { 
    icon: Users, 
    label: 'Profile', 
    href: '/dashboard/profile'
  },
  { 
    icon: SettingsIcon, 
    label: 'Settings', 
    href: '/dashboard/settings'
  }
];

const MenuItem = ({ icon: Icon, label, href, isActive }) => (
  <Link 
    href={href}
    className={`group flex w-full items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-300
      ${isActive 
        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
  >
    <Icon className={`h-5 w-5 transition-colors duration-200 
      ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} 
    />
    <span className="font-medium">{label}</span>
    {isActive && (
      <div className="ml-auto h-2 w-2 rounded-full bg-blue-400"/>
    )}
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [clubData, setClubData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No auth token found');

        const decoded = jwtDecode<{ username: string }>(token);
        if (!decoded.username) throw new Error('Invalid token');

        const clubInfo = await fetchClubByName(decoded.username);
        setClubData(clubInfo);
      } catch (err) {
        console.error('Error fetching club data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Menu Button */}
      <div className="fixed right-4 top-4 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-full bg-black/50 p-2 text-white backdrop-blur-lg transition-colors hover:bg-white/10"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 z-40 w-72 transform bg-gray-900/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 lg:bg-gray-900/50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="p-6">
          <h1 className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
            Your Club Name
          </h1>
          <p className="mt-1 text-sm text-gray-400">Club Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <MenuItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        {/* Profile Section */}
        {clubData && (
          <div className="absolute bottom-0 w-full p-4">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-[2px]">
                  <div className="h-full w-full rounded-full bg-gray-900">
                    <img
                      src={clubData.images?.[0] || '/default-avatar.svg'}
                      alt={clubData.displayName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-sm font-medium text-white">
                    {clubData.displayName}
                  </h3>
                  <p className="truncate text-xs text-gray-400">
                    {clubData.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72">
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}