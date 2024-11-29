"use client"

import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { fetchClubByName } from '@/app/lib/backendAPI';
import SplashScreen from '../splashscreen';
import Dashboard from './dashboard';
import Profile from './profile';
import Events from './events';
import Settings from './settings';
import LayoutManager from '../seatingLayout/layoutManager';

// Icons
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
import ReservationManagement from './reservations';

interface ClubProps {
  _id: string;
  username: string;
  displayName: string;
  description: string;
  formattedPrice: number;
  reviewCount: number;
  rating: number;
  location: string;
  features: string[];
  reservations: Array<{ date: string; count: number }>;
  images: string[];
  address: string;
  openingHours: {
    [key: string]: {
      isOpen: boolean;
      open: string;
      close: string;
    };
  };
  genres: string[];
  minAge: number;
  capacity: number;
  dressCode: string;
  contactInfo: Record<string, unknown>;
  socialMediaLinks: Record<string, unknown>;
}

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
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
    </button>
  );
};

const Layout: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [clubData, setClubData] = useState<ClubProps | null>(null);
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
        setClubData(clubInfo as ClubProps);
      } catch (err) {
        console.error('Error fetching club data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Calendar, label: 'Reservations', id: 'reservations' },
    { icon: TableProperties, label: 'Tables', id: 'tables' },
    { icon: CalendarDays, label: 'Events', id: 'events' },
    { icon: Users, label: 'Profile', id: 'profile' },
    { icon: SettingsIcon, label: 'Settings', id: 'settings' },
  ];

  const renderContent = () => {
    if (isLoading && !clubData) {
      return <SplashScreen />;
    }
    if (!clubData) return null;

    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'tables':
        return <LayoutManager id={clubData._id} date={new Date()} onSave={() => console.log("Saving Not Yet Implemented")} />;
      case 'events':
        return <Events />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      case 'reservations': // Added case for reservations
        return <ReservationManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black pt-10">
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

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 z-40 w-72 transform bg-gray-900/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 lg:bg-gray-900/50
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Logo */}
          <div className="p-6">
            <h1 className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
              To Kone
            </h1>
            <p className="mt-1 text-sm text-gray-400">Club Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activePage === item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsMobileMenuOpen(false);
                }}
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
                        src={clubData.images[0] || '/default-avatar.svg'}
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
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-72">
          <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;