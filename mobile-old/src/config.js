/**
 * Application Configuration
 */

// Replace with your backend URL
// For local development on physical device: use your computer's IP address
// For Android emulator: use 10.0.2.2
// For iOS simulator: use localhost or 127.0.0.1
export const API_BASE_URL = 'http://localhost:8000/api';

// Alternative configurations:
// export const API_BASE_URL = 'http://10.0.2.2:8000/api';  // Android emulator
// export const API_BASE_URL = 'http://192.168.1.XXX:8000/api';  // Physical device (replace with your IP)

export const CONFIG = {
  // API endpoints
  API_BASE_URL,

  // Assessment settings
  BASELINE_WEEK: 1,
  SPEECH_RECORDING_MIN_DURATION: 20, // seconds
  SPEECH_RECORDING_MAX_DURATION: 60, // seconds

  // Cognitive test settings
  REACTION_TEST_TRIALS: 10,
  MEMORY_TEST_TRIALS: 15,

  // Visual tracking settings
  TRACKING_DURATION: 10, // seconds

  // Score thresholds
  SCORE_THRESHOLDS: {
    STABLE: 15,
    MINOR: 35,
    MODERATE: 60
  },

  // Colors
  COLORS: {
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8'
  }
};
