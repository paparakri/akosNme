import React, { useState, useRef } from 'react';
import { 
  Bell, 
  Lock, 
  Sun, 
  User, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

const SettingSection = ({ title, icon: Icon, children }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-gray-900/50 p-6 backdrop-blur-lg">
      <div className="mb-6 flex items-center space-x-2">
        <Icon className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
};

const Switch = ({ isChecked, onChange }) => {
  return (
    <button
      onClick={() => onChange(!isChecked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out
        ${isChecked ? 'bg-blue-500' : 'bg-gray-700'}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${isChecked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
};

const Settings = () => {
  const [isOperational, setIsOperational] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      newReservations: true,
      cancellations: true,
      reviews: true,
      emailNotifications: true,
      pushNotifications: true,
    },
    security: {
      twoFactorAuth: false,
      publicProfile: true,
      showRevenue: false,
      shareAnalytics: true,
    },
    theme: {
      colorMode: 'dark',
      fontSize: 'medium',
      animations: true,
      highContrast: false,
    },
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleOperationalStatusChange = () => {
    setShowDialog(true);
  };

  const confirmStatusChange = () => {
    setIsOperational(!isOperational);
    setShowDialog(false);
  };

  return (
    <div className="space-y-8 pt-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-purple-400">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your club's preferences and account settings
        </p>
      </div>

      {/* Operational Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bell className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="text-lg font-medium text-white">Operational Status</h3>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                ${isOperational 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
                }`}>
                {isOperational ? 'Currently Open' : 'Currently Closed'}
              </span>
            </div>
          </div>
          <Switch
            isChecked={isOperational}
            onChange={handleOperationalStatusChange}
          />
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Notifications */}
        <SettingSection title="Notifications" icon={Bell}>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <Switch
                  isChecked={value}
                  onChange={(newValue) => handleSettingChange('notifications', key, newValue)}
                />
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Security & Privacy */}
        <SettingSection title="Security & Privacy" icon={Lock}>
          <div className="space-y-4">
            {Object.entries(settings.security).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <Switch
                  isChecked={value}
                  onChange={(newValue) => handleSettingChange('security', key, newValue)}
                />
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Theme & Accessibility */}
        <SettingSection title="Theme & Accessibility" icon={Sun}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Color Mode</label>
              <select
                value={settings.theme.colorMode}
                onChange={(e) => handleSettingChange('theme', 'colorMode', e.target.value)}
                className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Font Size</label>
              <select
                value={settings.theme.fontSize}
                onChange={(e) => handleSettingChange('theme', 'fontSize', e.target.value)}
                className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Enable Animations</label>
              <Switch
                isChecked={settings.theme.animations}
                onChange={(newValue) => handleSettingChange('theme', 'animations', newValue)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">High Contrast</label>
              <Switch
                isChecked={settings.theme.highContrast}
                onChange={(newValue) => handleSettingChange('theme', 'highContrast', newValue)}
              />
            </div>
          </div>
        </SettingSection>

        {/* Account Settings */}
        <SettingSection title="Account Settings" icon={User}>
          <div className="space-y-4">
            <button className="w-full rounded-lg bg-gray-800 px-4 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <span>Change Password</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </button>
            <button className="w-full rounded-lg bg-gray-800 px-4 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <span>Change Email Address</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </button>
            <button className="w-full rounded-lg bg-gray-800 px-4 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <span>Update Phone Number</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </button>
            <div className="h-px bg-gray-700" />
            <button className="w-full rounded-lg bg-red-500/10 px-4 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20">
              Delete Account
            </button>
          </div>
        </SettingSection>
      </div>

      {/* Status Change Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-gray-900 shadow-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-white">
                  {isOperational ? 'Close Club' : 'Open Club'}
                </h3>
              </div>
              <p className="mt-4 text-sm text-gray-300">
                Are you sure? This will {isOperational ? 'prevent' : 'allow'} new reservations 
                and affect your club's visibility.
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDialog(false)}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white
                    ${isOperational 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                    }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;