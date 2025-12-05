/**
 * Local Storage Service using AsyncStorage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_ID: '@neuroload_user_id',
  USERNAME: '@neuroload_username',
  CURRENT_WEEK: '@neuroload_current_week',
  BASELINE_COMPLETED: '@neuroload_baseline_completed'
};

export const StorageService = {
  // Save user ID
  saveUserId: async (userId) => {
    await AsyncStorage.setItem(KEYS.USER_ID, userId.toString());
  },

  // Get user ID
  getUserId: async () => {
    const userId = await AsyncStorage.getItem(KEYS.USER_ID);
    return userId ? parseInt(userId, 10) : null;
  },

  // Save username
  saveUsername: async (username) => {
    await AsyncStorage.setItem(KEYS.USERNAME, username);
  },

  // Get username
  getUsername: async () => {
    return await AsyncStorage.getItem(KEYS.USERNAME);
  },

  // Save current week
  saveCurrentWeek: async (week) => {
    await AsyncStorage.setItem(KEYS.CURRENT_WEEK, week.toString());
  },

  // Get current week
  getCurrentWeek: async () => {
    const week = await AsyncStorage.getItem(KEYS.CURRENT_WEEK);
    return week ? parseInt(week, 10) : 1;
  },

  // Save baseline status
  saveBaselineCompleted: async (completed) => {
    await AsyncStorage.setItem(KEYS.BASELINE_COMPLETED, completed.toString());
  },

  // Get baseline status
  getBaselineCompleted: async () => {
    const completed = await AsyncStorage.getItem(KEYS.BASELINE_COMPLETED);
    return completed === 'true';
  },

  // Clear all data
  clearAll: async () => {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  }
};

export default StorageService;
