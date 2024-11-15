'use client';

import React from "react";
import { Menu } from 'lucide-react';

export const UserMenu = ({ handleButtonClick, handleLogout, user }: { 
  handleButtonClick: (path: string) => void, 
  handleLogout: () => void, 
  user: any 
}) => {
  const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;

  const MenuButton = ({ isOpen }: { isOpen: boolean }) => (
    <div
      className="flex items-center space-x-2 px-3 py-2 rounded-full border border-white/10 
                 bg-black/50 backdrop-blur-md hover:bg-white/5 transition-all duration-200
                 cursor-pointer group"
    >
      <Menu className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-[2px]">
        <div className="h-full w-full rounded-full bg-black p-[2px]">
          <img
            src={user?.avatar || '/default-avatar.svg'}
            alt={user?.username || 'User'}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  );

  const normalUserMenu = (
    <div className="relative group">
      <MenuTrigger>
        <MenuButton isOpen={false} />
      </MenuTrigger>
      
      <MenuContent>
        {/* Profile Section */}
        <div className="px-4 py-3 border-b border-white/10">
          <MenuLink 
            onClick={() => handleButtonClick('/my-profile')}
            className="font-medium text-white hover:text-blue-400"
          >
            Show Profile
          </MenuLink>
        </div>

        {/* Main Actions */}
        <div className="px-2 py-2">
          <MenuLink onClick={() => handleButtonClick('/my-profile/friends')}>
            Friends
          </MenuLink>
          <MenuLink onClick={() => handleButtonClick('/my-profile/followed-clubs')}>
            Followed Clubs
          </MenuLink>
        </div>

        {/* Bookings & Messages */}
        <div className="px-2 py-2 border-t border-white/10">
          <MenuLink onClick={() => handleButtonClick('/my-profile/bookings')}>
            Bookings
          </MenuLink>
          <MenuLink onClick={() => handleButtonClick('/messages')}>
            Messages
          </MenuLink>
        </div>

        {/* Settings & Logout */}
        <div className="px-2 py-2 border-t border-white/10">
          <MenuLink onClick={() => handleButtonClick('/my-profile/account-settings')}>
            Account Settings
          </MenuLink>
          <MenuLink 
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            Log out
          </MenuLink>
        </div>
      </MenuContent>
    </div>
  );

  const clubUserMenu = (
    <div className="relative group">
      <MenuTrigger>
        <MenuButton isOpen={false} />
      </MenuTrigger>
      
      <MenuContent>
        {/* Profile Section */}
        <div className="px-4 py-3 border-b border-white/10">
          <MenuLink 
            onClick={() => handleButtonClick(`/club/${user?.username}`)}
            className="font-medium text-white hover:text-blue-400"
          >
            Show Club Page
          </MenuLink>
        </div>

        {/* Dashboard */}
        <div className="px-2 py-2">
          <MenuLink onClick={() => handleButtonClick('/club/dashboard')}>
            Club Dashboard
          </MenuLink>
        </div>

        {/* Logout */}
        <div className="px-2 py-2 border-t border-white/10">
          <MenuLink 
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            Log out
          </MenuLink>
        </div>
      </MenuContent>
    </div>
  );

  return userType === 'normal' ? normalUserMenu : clubUserMenu;
};

// Helper Components
const MenuTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    {children}
  </div>
);

const MenuContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
    <div className="rounded-xl bg-black/95 backdrop-blur-lg border border-white/10 shadow-2xl overflow-hidden">
      {children}
    </div>
  </div>
);

const MenuLink: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5
                transition-all duration-200 ${className}`}
  >
    {children}
  </button>
);

export default UserMenu;