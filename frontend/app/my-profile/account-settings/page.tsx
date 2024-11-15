"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Shield, Eye, Palette, User, Clock, Mail, Phone, 
  ChevronRight, Sun, Moon, Monitor, AlertCircle, BookOpen,
  Key,
  LifeBuoy,
  ChartBar,
  MapPin,
  Calendar
} from 'lucide-react';
import { useToast } from '@chakra-ui/react';
import { fetchUserSettings, switchUsername2Id, updateNormalUser } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';
import type { SettingsType } from './settingsTypes';

const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [activeSection, setActiveSection] = useState('notifications');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const toast = useToast();

  // Menu items configuration
  const menuItems = [
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'privacy', icon: Eye, label: 'Privacy' },
    { id: 'account', icon: User, label: 'Account Info' },
    { id: 'theme', icon: Palette, label: 'Theme & Accessibility' },
  ];

  const fetchSettings = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.username) {
        const id = await switchUsername2Id(user.username);
        setUserId(id);
        const fetchedSettings = await fetchUserSettings(id);
        setSettings(fetchedSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingChange = (path: string[], value: any) => {
    setSettings(prev => {
      if (!prev) return null;
      const newSettings = JSON.parse(JSON.stringify(prev));
      let current = newSettings;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newSettings;
    });

    // Show save indicator
    setShowSaveIndicator(true);
  };

  const handleSave = async () => {
    if (!userId || !settings) return;

    try {
      await updateNormalUser(userId, { accountSettings: settings });
      setShowSaveIndicator(false);
      // Show success message
      toast({
        title: "Settings Saved",
        description: "Your account settings have been saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors
                              ${activeSection === item.id 
                                ? 'bg-purple-500/20 text-purple-400' 
                                : 'hover:bg-white/5'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Section content */}
                  <div className="space-y-6">
                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          Notification Preferences
                        </h2>
                        
                        <div className="space-y-4">
                          <ToggleItem
                            icon={Mail}
                            label="Email Notifications"
                            description="Receive updates and alerts via email"
                            value={settings?.notifications.email}
                            onChange={(value) => handleSettingChange(['notifications', 'email'], value)}
                          />
                          
                          <ToggleItem
                            icon={Bell}
                            label="Push Notifications"
                            description="Get instant notifications on your device"
                            value={settings?.notifications.push}
                            onChange={(value) => handleSettingChange(['notifications', 'push'], value)}
                          />
                          
                          <div className="border-t border-white/10 pt-4">
                            <h3 className="text-lg font-semibold mb-4">Notification Triggers</h3>
                            
                            <div className="space-y-4 ml-4">
                              <ToggleItem
                                icon={BookOpen}
                                label="Club Events"
                                description="Notifications for events from clubs you follow"
                                value={settings?.notifications.choice.clubToggle}
                                onChange={(value) => handleSettingChange(['notifications', 'choice', 'clubToggle'], value)}
                              />
                              
                              <ToggleItem
                                icon={User}
                                label="Friend Activity"
                                description="Notifications about your friends' activities"
                                value={settings?.notifications.choice.friendToggle}
                                onChange={(value) => handleSettingChange(['notifications', 'choice', 'friendToggle'], value)}
                              />
                              
                              <ToggleItem
                                icon={Clock}
                                label="Reservation Reminders"
                                description={`Remind me ${settings?.notifications.choice.timeBefore} minutes before reservations`}
                                value={settings?.notifications.choice.timeToggle}
                                onChange={(value) => handleSettingChange(['notifications', 'choice', 'timeToggle'], value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Add other sections similarly */}
                    {/* Security Section */}
                    {activeSection === 'security' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          Security Settings
                        </h2>
                        
                        <div className="space-y-4">
                          <ToggleItem
                            icon={Shield}
                            label="Two-Factor Authentication"
                            description="Add an extra layer of security to your account"
                            value={settings?.security.twoFactor}
                            onChange={(value) => handleSettingChange(['security', 'twoFactor'], value)}
                          />

                          <div className="border-t border-white/10 pt-4 space-y-4">
                            <button
                              onClick={() => {/* Handle password change */}}
                              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 
                                        hover:bg-white/10 transition-colors group"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-lg bg-blue-500/20">
                                  <Key className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Change Password</h4>
                                  <p className="text-sm text-gray-400">Update your account password</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:transform 
                                                      group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                              onClick={() => {/* Handle recovery settings */}}
                              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 
                                        hover:bg-white/10 transition-colors group"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                  <LifeBuoy className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Recovery Settings</h4>
                                  <p className="text-sm text-gray-400">Manage account recovery options</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:transform 
                                                      group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Privacy Section */}
                    {activeSection === 'privacy' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          Privacy Settings
                        </h2>
                        
                        <div className="space-y-4">
                          <ToggleItem
                            icon={Eye}
                            label="Public Profile"
                            description="Make your profile visible to other users"
                            value={settings?.privacy.publicProfile}
                            onChange={(value) => handleSettingChange(['privacy', 'publicProfile'], value)}
                          />
                          
                          <ToggleItem
                            icon={ChartBar}
                            label="Share Usage Data"
                            description="Help us improve by sharing anonymous usage data"
                            value={settings?.privacy.shareData}
                            onChange={(value) => handleSettingChange(['privacy', 'shareData'], value)}
                          />

                          <div className="border-t border-white/10 pt-4">
                            <h3 className="text-lg font-semibold mb-4">Information Visibility</h3>
                            
                            <div className="space-y-4 ml-4">
                              <ToggleItem
                                icon={Mail}
                                label="Email Address"
                                description="Show email address on your public profile"
                                value={settings?.privacy.shareEmail}
                                onChange={(value) => handleSettingChange(['privacy', 'shareEmail'], value)}
                              />
                              
                              <ToggleItem
                                icon={MapPin}
                                label="Location"
                                description="Share your location with other users"
                                value={settings?.privacy.shareLocation}
                                onChange={(value) => handleSettingChange(['privacy', 'shareLocation'], value)}
                              />
                              
                              <ToggleItem
                                icon={Phone}
                                label="Phone Number"
                                description="Display phone number on your profile"
                                value={settings?.privacy.sharePhone}
                                onChange={(value) => handleSettingChange(['privacy', 'sharePhone'], value)}
                              />

                              <ToggleItem
                                icon={Calendar}
                                label="Reservations"
                                description="Allow others to see your reservations"
                                value={settings?.privacy.shareReservations}
                                onChange={(value) => handleSettingChange(['privacy', 'shareReservations'], value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Account Info Section */}
                    {activeSection === 'account' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          Account Information
                        </h2>
                        
                        <div className="space-y-4">
                          {['Email', 'Phone Number', 'Username'].map((field) => (
                            <button
                              key={field}
                              onClick={() => {/* Handle field change */}}
                              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 
                                        hover:bg-white/10 transition-colors group"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                  {field === 'Email' && <Mail className="w-5 h-5 text-purple-400" />}
                                  {field === 'Phone Number' && <Phone className="w-5 h-5 text-purple-400" />}
                                  {field === 'Username' && <User className="w-5 h-5 text-purple-400" />}
                                </div>
                                <div>
                                  <h4 className="font-medium">Change {field}</h4>
                                  <p className="text-sm text-gray-400">Update your {field.toLowerCase()}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:transform 
                                                      group-hover:translate-x-1 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Theme & Accessibility Section */}
                    {activeSection === 'theme' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          Theme & Accessibility
                        </h2>
                        
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Theme Preference</h3>
                            <div className="grid grid-cols-3 gap-4">
                              {[
                                { icon: Sun, label: 'Light', value: 'light' },
                                { icon: Moon, label: 'Dark', value: 'dark' },
                                { icon: Monitor, label: 'System', value: 'system' }
                              ].map(({ icon: Icon, label, value }) => (
                                <button
                                  key={value}
                                  onClick={() => handleSettingChange(['themeAccessibility', 'theme'], value)}
                                  className={`p-4 rounded-xl border transition-all
                                    ${settings?.themeAccessibility.theme === value
                                      ? 'border-purple-500 bg-purple-500/20'
                                      : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                >
                                  <div className="flex flex-col items-center space-y-2">
                                    <Icon className={`w-6 h-6 ${settings?.themeAccessibility.theme === value ? 'text-purple-400' : 'text-gray-400'}`} />
                                    <span className="text-sm font-medium">{label}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-semibold mb-4">Accessibility Options</h3>
                            <div className="grid grid-cols-3 gap-4">
                              {[
                                { label: 'Normal', description: 'Default viewing experience', value: 'normal' },
                                { label: 'High Contrast', description: 'Enhanced visual contrast', value: 'high' },
                                { label: 'Maximum', description: 'Maximum accessibility', value: 'extreme' }
                              ].map(({ label, description, value }) => (
                                <button
                                  key={value}
                                  onClick={() => handleSettingChange(['themeAccessibility', 'accessibility'], value)}
                                  className={`p-4 rounded-xl border text-left transition-all
                                    ${settings?.themeAccessibility.accessibility === value
                                      ? 'border-purple-500 bg-purple-500/20'
                                      : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                >
                                  <div className="space-y-1">
                                    <div className="font-medium">{label}</div>
                                    <div className="text-sm text-gray-400">{description}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Save Button - now anchored below the settings panel */}
            {showSaveIndicator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end mt-4"
              >
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 
                            transition-colors flex items-center space-x-2 shadow-lg shadow-purple-500/20"
                >
                  <span>Save Changes</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const ToggleItem = ({ 
  icon: Icon, 
  label, 
  description, 
  value, 
  onChange 
}: { 
  icon: any; 
  label: string; 
  description: string; 
  value?: boolean; 
  onChange: (value: boolean) => void; 
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
    <div className="flex items-center space-x-4">
      <div className="p-2 rounded-lg bg-purple-500/20">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200
                ${value ? 'bg-purple-500' : 'bg-gray-600'}`}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full"
        animate={{ x: value ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
);

export default SettingsPage;