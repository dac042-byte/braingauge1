/**
 * API Service for NeuroLoad Backend
 */
import axios from 'axios';
import { CONFIG } from '../config';

const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * API Service Methods
 */
export const ApiService = {
  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  createUser: async (username, email) => {
    const response = await api.post('/users', { username, email });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  listUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // ============================================================================
  // ASSESSMENT ENDPOINTS
  // ============================================================================

  startAssessment: async (userId, weekNumber, isBaseline = false) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('week_number', weekNumber);
    formData.append('is_baseline', isBaseline);

    const response = await api.post('/assessments/start', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getAssessment: async (assessmentId) => {
    const response = await api.get(`/assessments/${assessmentId}`);
    return response.data;
  },

  completeAssessment: async (assessmentId) => {
    const response = await api.post(`/assessments/${assessmentId}/complete`);
    return response.data;
  },

  // ============================================================================
  // SPEECH ANALYSIS ENDPOINTS
  // ============================================================================

  uploadSpeechRecording: async (assessmentId, audioFile) => {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioFile.uri,
      type: audioFile.type || 'audio/m4a',
      name: audioFile.name || 'recording.m4a'
    });

    const response = await api.post(
      `/assessments/${assessmentId}/speech`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  },

  // ============================================================================
  // COGNITIVE TEST ENDPOINTS
  // ============================================================================

  submitCognitiveTest: async (assessmentId, metrics) => {
    const response = await api.post(
      `/assessments/${assessmentId}/cognitive`,
      metrics
    );
    return response.data;
  },

  // ============================================================================
  // VISUAL TRACKING ENDPOINTS
  // ============================================================================

  submitVisualTracking: async (assessmentId, metrics) => {
    const response = await api.post(
      `/assessments/${assessmentId}/visual`,
      metrics
    );
    return response.data;
  },

  // ============================================================================
  // DASHBOARD ENDPOINTS
  // ============================================================================

  getDashboard: async (userId) => {
    const response = await api.get(`/users/${userId}/dashboard`);
    return response.data;
  },

  getUserHistory: async (userId, limit = 12) => {
    const response = await api.get(`/users/${userId}/history`, {
      params: { limit }
    });
    return response.data;
  },

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default ApiService;
