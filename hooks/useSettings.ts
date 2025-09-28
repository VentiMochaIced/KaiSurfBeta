import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppSettings {
  homepage: string;
  searchEngine: string;
  privateBrowsing: boolean;
  blockPopups: boolean;
  clearDataOnExit: boolean;
  darkMode: boolean;
  showStatusBar: boolean;
  javascriptEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  homepage: 'https://www.google.com',
  searchEngine: 'Google',
  privateBrowsing: false,
  blockPopups: true,
  clearDataOnExit: false,
  darkMode: false,
  showStatusBar: true,
  javascriptEnabled: true,
};

const SETTINGS_KEY = '@koralai_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        // Merge with defaults to ensure all settings are present
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        // First time setup - save default settings
        await saveSettingsToStorage(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to defaults if loading fails
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const saveSettingsToStorage = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await saveSettingsToStorage(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const resetSettings = async () => {
    try {
      await saveSettingsToStorage(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  };

  const getSetting = (key: keyof AppSettings) => {
    return settings[key];
  };

  return {
    settings,
    loading,
    updateSettings,
    resetSettings,
    getSetting,
  };
}