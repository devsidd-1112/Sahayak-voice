/**
 * API Configuration
 * 
 * Central configuration for backend API endpoints
 */

// Backend API base URL
// For Android emulator: use 10.0.2.2 instead of localhost
// For real device: use your computer's IP address
export const API_BASE_URL = __DEV__
  ? 'http://172.20.10.2:8080/api'
  : 'https://your-production-api.com/api';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    SIGNUP: '/auth/signup',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },
  VISITS: {
    SYNC: '/visits/sync',
    GET_ALL: '/visits',
    GET_BY_ID: (id: string) => `/visits/${id}`,
  },
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// JWT token storage key
export const TOKEN_STORAGE_KEY = '@sahayak_auth_token';
