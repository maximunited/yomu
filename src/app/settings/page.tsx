'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Moon,
  Sun,
  LogOut,
  Camera,
  Save,
  Bell,
  Shield,
  Globe,
  Key,
  Copy,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

interface UserProfile {
  name: string;
  email: string;
  dateOfBirth: string;
  anniversaryDate?: string;
  profilePicture?: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    dateOfBirth: '',
    anniversaryDate: '',
    profilePicture: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiKey, setApiKey] = useState('key123');
  const [isApiKeyEditing, setIsApiKeyEditing] = useState(false);
  const [isApiKeySaving, setIsApiKeySaving] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);

    // Apply dark mode to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Load profile data
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setProfile((prev) => ({
              ...prev,
              ...data.user,
              // Convert null dates to empty strings for React inputs
              dateOfBirth: data.user.dateOfBirth
                ? new Date(data.user.dateOfBirth).toISOString().split('T')[0]
                : '',
              anniversaryDate: data.user.anniversaryDate
                ? new Date(data.user.anniversaryDate)
                    .toISOString()
                    .split('T')[0]
                : '',
            }));
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();

    // Load API key
    const loadApiKey = async () => {
      try {
        const response = await fetch('/api/user/api-key');
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };

    loadApiKey();
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveProfile = async () => {
    // Validate required fields
    if (!profile.name.trim()) {
      console.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          dateOfBirth: profile.dateOfBirth,
          anniversaryDate: profile.anniversaryDate,
          profilePicture: profile.profilePicture,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the profile with the saved data
        setProfile((prev) => ({
          ...prev,
          ...data.user,
          // Convert null dates to empty strings for React inputs
          dateOfBirth: data.user.dateOfBirth
            ? new Date(data.user.dateOfBirth).toISOString().split('T')[0]
            : '',
          anniversaryDate: data.user.anniversaryDate
            ? new Date(data.user.anniversaryDate).toISOString().split('T')[0]
            : '',
        }));
        setIsEditing(false);
        // Show success message (you could add a toast notification here)
      } else {
        console.error('Failed to save profile');
        // Show error message
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newProfilePicture = e.target?.result as string;
        setProfile((prev) => ({
          ...prev,
          profilePicture: newProfilePicture,
        }));

        // Auto-save the profile picture immediately
        saveProfilePicture(newProfilePicture);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfilePicture = async (profilePicture: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          dateOfBirth: profile.dateOfBirth,
          anniversaryDate: profile.anniversaryDate,
          profilePicture: profilePicture,
        }),
      });

      if (response.ok) {
        console.log('Profile picture saved successfully');
        // Could add a toast notification here
      } else {
        console.error('Failed to save profile picture');
        // Could add error notification here
      }
    } catch (error) {
      console.error('Error saving profile picture:', error);
      // Could add error notification here
    }
  };

  const handleSaveApiKey = async () => {
    setIsApiKeySaving(true);
    try {
      const response = await fetch('/api/user/api-key', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        setIsApiKeyEditing(false);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsApiKeySaving(false);
    }
  };

  const copyApiKeyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying API key:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  {t('back')}
                </Button>
              </Link>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t('settings')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Section */}
          <div
            id="profile"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('profile')}
              </h2>
            </div>

            {/* Profile Picture */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-full cursor-pointer hover:bg-purple-700">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t('profilePicture')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('clickToChange')}
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('fullName')}
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('email')}
                </label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('emailPermanent')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('dateOfBirth')}
                  </label>
                  <Input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('anniversaryDate')} ({t('optional')})
                  </label>
                  <Input
                    type="date"
                    value={profile.anniversaryDate}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        anniversaryDate: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <User className="w-4 h-4 ml-2" />
                    {t('editProfile')}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      {isSaving ? t('saving') : t('saveChanges')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      {t('cancel')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* API Key Section */}
          <div
            id="api-key"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Key className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('apiKey')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('apiKey')}
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={!isApiKeyEditing}
                    className="flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyApiKeyToClipboard}
                    className="flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    {t('copyApiKey')}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('apiKeyDescription')}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                {!isApiKeyEditing ? (
                  <Button onClick={() => setIsApiKeyEditing(true)}>
                    <Key className="w-4 h-4 ml-2" />
                    {t('editApiKey')}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveApiKey}
                      disabled={isApiKeySaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      {isApiKeySaving ? t('saving') : t('saveApiKey')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsApiKeyEditing(false);
                        setApiKey('key123'); // Reset to default
                      }}
                    >
                      {t('cancel')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div
            id="appearance"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              {isDarkMode ? (
                <Moon className="w-6 h-6 text-purple-600" />
              ) : (
                <Sun className="w-6 h-6 text-purple-600" />
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('appearance')}
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t('darkMode')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('darkModeDescription')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={toggleDarkMode}
                className="flex items-center space-x-2"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span>{isDarkMode ? t('lightMode') : t('darkMode')}</span>
              </Button>
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('language')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t('interfaceLanguage')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('languageDescription')}
                </p>
                <LanguageSelector variant="dropdown" showBeta={true} />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('betaLanguagesNote')}
                </p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div
            id="notifications"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('notifications')}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {t('emailNotifications')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('emailNotificationsDescription')}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        email: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {t('pushNotifications')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('pushNotificationsDescription')}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        push: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {t('smsNotifications')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('smsNotificationsDescription')}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        sms: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div
            id="account"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('account')}
              </h2>
            </div>

            <div className="space-y-4">
              <Link href="/privacy">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 ml-2" />
                  {t('privacyPolicy')}
                </Button>
              </Link>

              <Link href="/terms">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 ml-2" />
                  {t('termsOfService')}
                </Button>
              </Link>

              <Link href="/contact">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 ml-2" />
                  {t('contact')}
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 ml-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
