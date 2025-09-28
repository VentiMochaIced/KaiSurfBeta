import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivityLog {
  id: string;
  timestamp: string;
  activity_type: string;
  content: string;
  module?: string;
}

interface ModuleFeedback {
  module_name: string;
  feedback_type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  file_reference?: string;
}

const ACTIVITY_LOG_KEY = '@koralai_activity_log';
const MODULE_FEEDBACK_KEY = '@koralai_module_feedback';

export function useModuleFeedback() {
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [moduleFeedback, setModuleFeedback] = useState<ModuleFeedback[]>([]);

  useEffect(() => {
    loadActivityLog();
    loadModuleFeedback();
  }, []);

  const loadActivityLog = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACTIVITY_LOG_KEY);
      if (stored) {
        setActivityLog(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading activity log:', error);
    }
  };

  const loadModuleFeedback = async () => {
    try {
      const stored = await AsyncStorage.getItem(MODULE_FEEDBACK_KEY);
      if (stored) {
        setModuleFeedback(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading module feedback:', error);
    }
  };

  const logActivity = async (activityType: string, content: string, module?: string) => {
    try {
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        activity_type: activityType,
        content,
        module,
      };

      const updatedLog = [newActivity, ...activityLog].slice(0, 1000); // Keep last 1000 entries
      setActivityLog(updatedLog);
      await AsyncStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(updatedLog));
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const addModuleFeedback = async (
    moduleName: string,
    feedbackType: ModuleFeedback['feedback_type'],
    message: string,
    fileReference?: string
  ) => {
    try {
      const newFeedback: ModuleFeedback = {
        module_name: moduleName,
        feedback_type: feedbackType,
        message,
        timestamp: new Date().toISOString(),
        file_reference: fileReference,
      };

      const updatedFeedback = [newFeedback, ...moduleFeedback].slice(0, 500); // Keep last 500 entries
      setModuleFeedback(updatedFeedback);
      await AsyncStorage.setItem(MODULE_FEEDBACK_KEY, JSON.stringify(updatedFeedback));
    } catch (error) {
      console.error('Error adding module feedback:', error);
    }
  };

  const getModuleFeedback = (moduleName?: string) => {
    if (moduleName) {
      return moduleFeedback.filter(feedback => feedback.module_name === moduleName);
    }
    return moduleFeedback;
  };

  const getActivityLog = (activityType?: string) => {
    if (activityType) {
      return activityLog.filter(activity => activity.activity_type === activityType);
    }
    return activityLog;
  };

  const clearActivityLog = async () => {
    try {
      setActivityLog([]);
      await AsyncStorage.removeItem(ACTIVITY_LOG_KEY);
    } catch (error) {
      console.error('Error clearing activity log:', error);
    }
  };

  const clearModuleFeedback = async () => {
    try {
      setModuleFeedback([]);
      await AsyncStorage.removeItem(MODULE_FEEDBACK_KEY);
    } catch (error) {
      console.error('Error clearing module feedback:', error);
    }
  };

  // Simulate KAiSurf login module integration
  const simulateKAiSurfLogin = async (roamingId: string) => {
    try {
      logActivity('KAISURF_LOGIN_ATTEMPT', `Login attempt with roaming ID: ${roamingId}`, 'KAiSurf');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success/failure
      const success = Math.random() > 0.3; // 70% success rate
      
      if (success) {
        const dailyUsername = `${roamingId.split(' ')[0]}-${new Date().toISOString().split('T')[0]}-${roamingId.split(' ')[1]}`;
        logActivity('KAISURF_LOGIN_SUCCESS', `Successful login with username: ${dailyUsername}`, 'KAiSurf');
        addModuleFeedback('KAiSurf', 'SUCCESS', `Login successful. Daily username: ${dailyUsername}`);
        return { success: true, username: dailyUsername };
      } else {
        logActivity('KAISURF_LOGIN_FAILURE', 'Login failed - invalid credentials', 'KAiSurf');
        addModuleFeedback('KAiSurf', 'ERROR', 'Login failed. Please check your roaming ID.');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      logActivity('KAISURF_LOGIN_ERROR', `Login error: ${error}`, 'KAiSurf');
      addModuleFeedback('KAiSurf', 'ERROR', `Login system error: ${error}`);
      return { success: false, error: 'System error' };
    }
  };

  return {
    activityLog,
    moduleFeedback,
    logActivity,
    addModuleFeedback,
    getModuleFeedback,
    getActivityLog,
    clearActivityLog,
    clearModuleFeedback,
    simulateKAiSurfLogin,
  };
}