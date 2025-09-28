import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert
} from 'react-native';
import { 
  Settings as SettingsIcon, 
  Home, 
  Shield, 
  Smartphone, 
  Moon,
  Save,
  RotateCcw,
  Activity,
  FileText
} from 'lucide-react-native';
import { useSettings } from '@/hooks/useSettings';
import { useModuleFeedback } from '@/hooks/useModuleFeedback';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function SettingsScreen() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { getActivityLog, getModuleFeedback, clearActivityLog, clearModuleFeedback } = useModuleFeedback();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showModuleInfo, setShowModuleInfo] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, localSettings]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(localSettings);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Settings Saved', 'Your preferences have been updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSettings();
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              Alert.alert('Settings Reset', 'All settings have been reset to defaults');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ]
    );
  };

  const SettingCard = ({ 
    title, 
    subtitle, 
    icon: Icon, 
    children 
  }: { 
    title: string;
    subtitle?: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <View style={styles.settingCard}>
      <View style={styles.settingHeader}>
        <View style={styles.settingIconContainer}>
          <Icon size={20} color="#007AFF" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        
        {hasUnsavedChanges && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSaveSettings}
            >
              <Save size={20} color="#007AFF" />
              <Text style={styles.headerButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <Text style={styles.sectionTitle}>General</Text>
        
        <SettingCard
          title="Homepage URL"
          subtitle="The page that opens when you start the browser"
          icon={Home}
        >
          <TextInput
            style={styles.textInput}
            value={localSettings.homepage}
            onChangeText={(value) => handleSettingChange('homepage', value)}
            placeholder="https://www.google.com"
            placeholderTextColor="#8E8E93"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </SettingCard>

        <SettingCard
          title="Search Engine"
          subtitle="Default search provider"
          icon={SettingsIcon}
        >
          <View style={styles.optionContainer}>
            {['Google', 'DuckDuckGo', 'Bing'].map((engine) => (
              <TouchableOpacity
                key={engine}
                style={[
                  styles.optionButton,
                  localSettings.searchEngine === engine && styles.selectedOption
                ]}
                onPress={() => handleSettingChange('searchEngine', engine)}
              >
                <Text style={[
                  styles.optionText,
                  localSettings.searchEngine === engine && styles.selectedOptionText
                ]}>
                  {engine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingCard>

        {/* Privacy & Security */}
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        
        <SettingCard
          title="Private Browsing"
          subtitle="Don't save browsing history or cookies"
          icon={Shield}
        >
          <Switch
            value={localSettings.privateBrowsing}
            onValueChange={(value) => handleSettingChange('privateBrowsing', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </SettingCard>

        <SettingCard
          title="Block Pop-ups"
          subtitle="Prevent websites from opening pop-up windows"
          icon={Shield}
        >
          <Switch
            value={localSettings.blockPopups}
            onValueChange={(value) => handleSettingChange('blockPopups', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </SettingCard>

        <SettingCard
          title="Clear Data on Exit"
          subtitle="Clear browsing data when closing the app"
          icon={Shield}
        >
          <Switch
            value={localSettings.clearDataOnExit}
            onValueChange={(value) => handleSettingChange('clearDataOnExit', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </SettingCard>

        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <SettingCard
          title="Dark Mode"
          subtitle="Use dark theme throughout the app"
          icon={Moon}
        >
          <Switch
            value={localSettings.darkMode}
            onValueChange={(value) => handleSettingChange('darkMode', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </SettingCard>

        <SettingCard
          title="Show Status Bar"
          subtitle="Display loading progress and page status"
          icon={Smartphone}
        >
          <Switch
            value={localSettings.showStatusBar}
            onValueChange={(value) => handleSettingChange('showStatusBar', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </SettingCard>

        {/* Advanced */}
        <Text style={styles.sectionTitle}>Advanced</Text>
        
        <SettingCard
          title="JavaScript Enabled"
          subtitle="Allow websites to run JavaScript code"
          icon={SettingsIcon}
        >
          <Switch
            value={localSettings.javascriptEnabled}
            onValueChange={(value) => handleSettingChange('javascriptEnabled', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </SettingCard>

        {/* Module Support & Feedback */}
        <Text style={styles.sectionTitle}>Module Support</Text>
        
        <SettingCard
          title="Activity Logging"
          subtitle="Track browser and module activities"
          icon={Activity}
        >
          <View style={styles.moduleInfoContainer}>
            <Text style={styles.moduleInfoText}>
              Activity Log Entries: {getActivityLog().length}
            </Text>
            <Text style={styles.moduleInfoText}>
              Module Feedback: {getModuleFeedback().length}
            </Text>
            <TouchableOpacity
              style={styles.clearDataButton}
              onPress={async () => {
                Alert.alert(
                  'Clear Module Data',
                  'This will clear all activity logs and module feedback. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: async () => {
                        await clearActivityLog();
                        await clearModuleFeedback();
                        Alert.alert('Cleared', 'Module data has been cleared');
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.clearDataButtonText}>Clear Module Data</Text>
            </TouchableOpacity>
          </View>
        </SettingCard>

        <SettingCard
          title="File Reference Support"
          subtitle="Enable module file feedback integration"
          icon={FileText}
        >
          <Switch
            value={localSettings.moduleFileSupport || false}
            onValueChange={(value) => handleSettingChange('moduleFileSupport', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </SettingCard>

        <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
          <RotateCcw size={20} color="#FF3B30" />
          <Text style={styles.resetButtonText}>Reset All Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  moduleInfoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  moduleInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clearDataButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDataButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});