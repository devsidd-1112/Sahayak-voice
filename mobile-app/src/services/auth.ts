import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {AxiosError} from 'axios';
import {API_BASE_URL, API_ENDPOINTS, REQUEST_TIMEOUT, TOKEN_STORAGE_KEY} from '../config/api';
import {LoginRequest, AuthResponse, User} from '../types';

/**
 * Authentication API Service
 * 
 * Handles authentication with the backend API including:
 * - Login requests
 * - Token storage in AsyncStorage
 * - Token retrieval
 * - Logout functionality
 * - Error handling
 * 
 * Requirements: 1.1, 1.4, 1.5
 */

// User session storage key
const USER_SESSION_KEY = '@sahayak_user_session';

/**
 * Login to the backend API
 * 
 * @param phoneNumber - User's phone number
 * @param password - User's password
 * @returns Promise<User> - User object with authentication token
 * @throws Error if authentication fails
 * 
 * Requirements: 1.1, 1.4
 */
export const login = async (phoneNumber: string, password: string): Promise<User> => {
  try {
    const loginRequest: LoginRequest = {
      phoneNumber,
      password,
    };

    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`;
    console.log('=== LOGIN REQUEST ===');
    console.log('URL:', url);
    console.log('Phone:', phoneNumber);
    console.log('====================');

    // Make POST request to login endpoint
    const response = await axios.post<AuthResponse>(
      url,
      loginRequest,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const authResponse = response.data;
    console.log('Login successful!');

    // Create user object
    const user: User = {
      id: authResponse.userId,
      name: authResponse.name,
      phoneNumber,
      token: authResponse.token,
    };

    // Store authentication token in AsyncStorage
    await storeAuthToken(authResponse.token);
    
    // Store user session
    await storeUserSession(user);

    return user;
  } catch (error) {
    console.log('=== LOGIN ERROR ===');
    console.log('Error:', error);
    console.log('==================');
    
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with error status
        const status = axiosError.response.status;
        
        if (status === 401) {
          throw new Error('अमान्य फ़ोन नंबर या पासवर्ड / Invalid phone number or password');
        } else if (status === 400) {
          throw new Error('अमान्य अनुरोध / Invalid request');
        } else if (status >= 500) {
          throw new Error('सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें / Server error. Please try again later');
        }
      } else if (axiosError.request) {
        // Request made but no response received
        throw new Error('नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें / Network error. Please check your internet connection');
      }
    }
    
    // Generic error
    throw new Error('लॉगिन विफल। कृपया पुनः प्रयास करें / Login failed. Please try again');
  }
};

/**
 * Store authentication token in AsyncStorage
 * 
 * @param token - JWT authentication token
 * @returns Promise<void>
 * 
 * Requirements: 1.5
 */
export const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error('Failed to store auth token:', error);
    throw new Error('Failed to store authentication token');
  }
};

/**
 * Retrieve authentication token from AsyncStorage
 * 
 * @returns Promise<string | null> - JWT token or null if not found
 * 
 * Requirements: 1.5
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    return token;
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
};

/**
 * Store user session in AsyncStorage
 * 
 * @param user - User object to store
 * @returns Promise<void>
 */
export const storeUserSession = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user session:', error);
    throw new Error('Failed to store user session');
  }
};

/**
 * Retrieve user session from AsyncStorage
 * 
 * @returns Promise<User | null> - User object or null if not found
 */
export const getUserSession = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_SESSION_KEY);
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve user session:', error);
    return null;
  }
};

/**
 * Clear authentication token and user session (logout)
 * 
 * @returns Promise<void>
 */
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_SESSION_KEY]);
  } catch (error) {
    console.error('Failed to logout:', error);
    throw new Error('Failed to logout');
  }
};

/**
 * Signup - Register a new user and send OTP
 * 
 * @param name - User's name
 * @param phoneNumber - User's phone number
 * @param password - User's password
 * @returns Promise<void>
 * @throws Error if signup fails
 */
export const signup = async (name: string, phoneNumber: string, password: string): Promise<void> => {
  try {
    const signupRequest = {
      name,
      phoneNumber,
      password,
    };

    await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`,
      signupRequest,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data: any = axiosError.response.data;
        
        if (status === 400 && data?.message) {
          throw new Error(data.message);
        } else if (status >= 500) {
          throw new Error('सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें / Server error. Please try again later');
        }
      } else if (axiosError.request) {
        throw new Error('नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें / Network error. Please check your internet connection');
      }
    }
    
    throw new Error('साइनअप विफल। कृपया पुनः प्रयास करें / Signup failed. Please try again');
  }
};

/**
 * Verify OTP and complete registration
 * 
 * @param phoneNumber - User's phone number
 * @param otp - OTP code received
 * @returns Promise<User> - User object with authentication token
 * @throws Error if verification fails
 */
export const verifyOtp = async (phoneNumber: string, otp: string): Promise<User> => {
  try {
    const verifyRequest = {
      phoneNumber,
      otp,
    };

    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_OTP}`,
      verifyRequest,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const authResponse = response.data;

    // Create user object
    const user: User = {
      id: authResponse.userId,
      name: authResponse.name,
      phoneNumber,
      token: authResponse.token,
    };

    // Store authentication token
    await storeAuthToken(authResponse.token);
    
    // Store user session
    await storeUserSession(user);

    return user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data: any = axiosError.response.data;
        
        if (status === 400 && data?.message) {
          throw new Error(data.message);
        } else if (status >= 500) {
          throw new Error('सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें / Server error. Please try again later');
        }
      } else if (axiosError.request) {
        throw new Error('नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें / Network error. Please check your internet connection');
      }
    }
    
    throw new Error('OTP सत्यापन विफल। कृपया पुनः प्रयास करें / OTP verification failed. Please try again');
  }
};

/**
 * Resend OTP for phone number verification
 * 
 * @param phoneNumber - User's phone number
 * @returns Promise<void>
 * @throws Error if resend fails
 */
export const resendOtp = async (phoneNumber: string): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.RESEND_OTP}`,
      null,
      {
        params: { phoneNumber },
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data: any = axiosError.response.data;
        
        if (status === 400 && data?.message) {
          throw new Error(data.message);
        } else if (status >= 500) {
          throw new Error('सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें / Server error. Please try again later');
        }
      } else if (axiosError.request) {
        throw new Error('नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें / Network error. Please check your internet connection');
      }
    }
    
    throw new Error('OTP पुनः भेजना विफल। कृपया पुनः प्रयास करें / Failed to resend OTP. Please try again');
  }
};

/**
 * Check if user is authenticated
 * 
 * @returns Promise<boolean> - True if user has valid token
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return token !== null;
};

/**
 * Create axios instance with authentication header
 * 
 * @returns Promise<axios instance> - Axios instance with auth header
 */
export const createAuthenticatedAxiosInstance = async () => {
  const token = await getAuthToken();
  
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...(token && {Authorization: `Bearer ${token}`}),
    },
  });
};
