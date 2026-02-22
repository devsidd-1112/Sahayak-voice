import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  login,
  storeAuthToken,
  getAuthToken,
  storeUserSession,
  getUserSession,
  logout,
  isAuthenticated,
  createAuthenticatedAxiosInstance,
} from '../auth';
import {AuthResponse, User} from '../../types';
import {TOKEN_STORAGE_KEY} from '../../config/api';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Authentication Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockPhoneNumber = '9876543210';
    const mockPassword = 'password123';
    const mockAuthResponse: AuthResponse = {
      token: 'mock-jwt-token',
      userId: 'user-123',
      name: 'Test User',
    };

    it('should successfully login with valid credentials', async () => {
      // Mock successful API response
      mockedAxios.post.mockResolvedValueOnce({
        data: mockAuthResponse,
      });

      // Mock AsyncStorage
      mockedAsyncStorage.setItem.mockResolvedValue();

      const result = await login(mockPhoneNumber, mockPassword);

      // Verify API call
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        {phoneNumber: mockPhoneNumber, password: mockPassword},
        expect.objectContaining({
          timeout: expect.any(Number),
          headers: {'Content-Type': 'application/json'},
        })
      );

      // Verify token storage
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        TOKEN_STORAGE_KEY,
        mockAuthResponse.token
      );

      // Verify user session storage
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        '@sahayak_user_session',
        expect.stringContaining(mockAuthResponse.userId)
      );

      // Verify returned user object
      expect(result).toEqual({
        id: mockAuthResponse.userId,
        name: mockAuthResponse.name,
        phoneNumber: mockPhoneNumber,
        token: mockAuthResponse.token,
      });
    });

    it('should throw error for invalid credentials (401)', async () => {
      // Mock 401 error response
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 401,
        },
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(login(mockPhoneNumber, mockPassword)).rejects.toThrow(
        /Invalid phone number or password/
      );
    });

    it('should throw error for bad request (400)', async () => {
      // Mock 400 error response
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 400,
        },
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(login(mockPhoneNumber, mockPassword)).rejects.toThrow(
        /Invalid request/
      );
    });

    it('should throw error for server error (500)', async () => {
      // Mock 500 error response
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 500,
        },
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(login(mockPhoneNumber, mockPassword)).rejects.toThrow(
        /Server error/
      );
    });

    it('should throw error for network error', async () => {
      // Mock network error (no response)
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        request: {},
      });

      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(login(mockPhoneNumber, mockPassword)).rejects.toThrow(
        /Network error/
      );
    });

    it('should throw generic error for unknown errors', async () => {
      // Mock unknown error
      mockedAxios.post.mockRejectedValueOnce(new Error('Unknown error'));

      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(login(mockPhoneNumber, mockPassword)).rejects.toThrow(
        /Login failed/
      );
    });
  });

  describe('storeAuthToken', () => {
    it('should store token in AsyncStorage', async () => {
      const mockToken = 'mock-jwt-token';
      mockedAsyncStorage.setItem.mockResolvedValue();

      await storeAuthToken(mockToken);

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        TOKEN_STORAGE_KEY,
        mockToken
      );
    });

    it('should throw error if storage fails', async () => {
      const mockToken = 'mock-jwt-token';
      mockedAsyncStorage.setItem.mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(storeAuthToken(mockToken)).rejects.toThrow(
        'Failed to store authentication token'
      );
    });
  });

  describe('getAuthToken', () => {
    it('should retrieve token from AsyncStorage', async () => {
      const mockToken = 'mock-jwt-token';
      mockedAsyncStorage.getItem.mockResolvedValueOnce(mockToken);

      const result = await getAuthToken();

      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
        TOKEN_STORAGE_KEY
      );
      expect(result).toBe(mockToken);
    });

    it('should return null if token not found', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await getAuthToken();

      expect(result).toBeNull();
    });

    it('should return null if retrieval fails', async () => {
      mockedAsyncStorage.getItem.mockRejectedValueOnce(
        new Error('Retrieval error')
      );

      const result = await getAuthToken();

      expect(result).toBeNull();
    });
  });

  describe('storeUserSession', () => {
    it('should store user session in AsyncStorage', async () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'Test User',
        phoneNumber: '9876543210',
        token: 'mock-jwt-token',
      };

      mockedAsyncStorage.setItem.mockResolvedValue();

      await storeUserSession(mockUser);

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        '@sahayak_user_session',
        JSON.stringify(mockUser)
      );
    });

    it('should throw error if storage fails', async () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'Test User',
        phoneNumber: '9876543210',
        token: 'mock-jwt-token',
      };

      mockedAsyncStorage.setItem.mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(storeUserSession(mockUser)).rejects.toThrow(
        'Failed to store user session'
      );
    });
  });

  describe('getUserSession', () => {
    it('should retrieve user session from AsyncStorage', async () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'Test User',
        phoneNumber: '9876543210',
        token: 'mock-jwt-token',
      };

      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockUser)
      );

      const result = await getUserSession();

      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
        '@sahayak_user_session'
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if session not found', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await getUserSession();

      expect(result).toBeNull();
    });

    it('should return null if retrieval fails', async () => {
      mockedAsyncStorage.getItem.mockRejectedValueOnce(
        new Error('Retrieval error')
      );

      const result = await getUserSession();

      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear token and user session from AsyncStorage', async () => {
      (mockedAsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await logout();

      expect(mockedAsyncStorage.multiRemove).toHaveBeenCalledWith([
        TOKEN_STORAGE_KEY,
        '@sahayak_user_session',
      ]);
    });

    it('should throw error if logout fails', async () => {
      (mockedAsyncStorage.multiRemove as jest.Mock).mockRejectedValueOnce(
        new Error('Logout error')
      );

      await expect(logout()).rejects.toThrow('Failed to logout');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce('mock-jwt-token');

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false if token does not exist', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('createAuthenticatedAxiosInstance', () => {
    it('should create axios instance with auth header when token exists', async () => {
      const mockToken = 'mock-jwt-token';
      mockedAsyncStorage.getItem.mockResolvedValueOnce(mockToken);

      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {},
          },
        },
      };

      mockedAxios.create.mockReturnValueOnce(mockAxiosInstance as any);

      await createAuthenticatedAxiosInstance();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should create axios instance without auth header when token does not exist', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const mockAxiosInstance = {
        defaults: {
          headers: {
            common: {},
          },
        },
      };

      mockedAxios.create.mockReturnValueOnce(mockAxiosInstance as any);

      await createAuthenticatedAxiosInstance();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );
    });
  });
});
