import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SyncManager from '../syncManager';
import {databaseService} from '../database';
import {createAuthenticatedAxiosInstance} from '../auth';
import {VisitRecord, SyncResult} from '../../types';

// Mock dependencies
jest.mock('@react-native-community/netinfo');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../database');
jest.mock('../auth');

const mockedNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockedDatabaseService = databaseService as jest.Mocked<typeof databaseService>;
const mockedCreateAuthenticatedAxiosInstance = createAuthenticatedAxiosInstance as jest.MockedFunction<typeof createAuthenticatedAxiosInstance>;

describe('SyncManager', () => {
  let syncManager: SyncManager;

  beforeEach(() => {
    syncManager = new SyncManager();
    jest.clearAllMocks();
  });

  describe('syncPendingRecords', () => {
    const mockPendingRecords: VisitRecord[] = [
      {
        id: 1,
        patientName: 'Test Patient 1',
        bloodPressure: '120/80',
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending',
        userId: 'user-123',
      },
      {
        id: 2,
        patientName: 'Test Patient 2',
        bloodPressure: '130/85',
        childSymptom: 'Cough',
        visitDate: '2024-01-21',
        createdAt: '2024-01-21T11:00:00Z',
        syncStatus: 'pending',
        userId: 'user-123',
      },
    ];

    it('should return error when offline', async () => {
      // Mock offline state
      mockedNetInfo.fetch.mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      } as any);

      const result = await syncManager.syncPendingRecords();

      expect(result.totalRecords).toBe(0);
      expect(result.syncedRecords).toBe(0);
      expect(result.failedRecords).toBe(0);
      expect(result.errors).toContain('No internet connection available');
      expect(mockedDatabaseService.getPendingVisits).not.toHaveBeenCalled();
    });

    it('should return early when no pending records', async () => {
      // Mock online state
      mockedNetInfo.fetch.mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
      } as any);

      // Mock empty pending records
      mockedDatabaseService.getPendingVisits.mockResolvedValueOnce([]);

      const result = await syncManager.syncPendingRecords();

      expect(result.totalRecords).toBe(0);
      expect(result.syncedRecords).toBe(0);
      expect(result.failedRecords).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should successfully sync all pending records', async () => {
      // Mock online state
      mockedNetInfo.fetch.mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
      } as any);

      // Mock pending records
      mockedDatabaseService.getPendingVisits.mockResolvedValueOnce(mockPendingRecords);

      // Mock axios instance
      const mockAxiosInstance = {
        post: jest.fn().mockResolvedValue({
          status: 201,
          data: {},
        }),
      };
      mockedCreateAuthenticatedAxiosInstance.mockResolvedValueOnce(mockAxiosInstance as any);

      // Mock database update
      mockedDatabaseService.updateSyncStatus.mockResolvedValue();

      // Mock AsyncStorage
      mockedAsyncStorage.setItem.mockResolvedValue();

      const result = await syncManager.syncPendingRecords();

      expect(result.totalRecords).toBe(2);
      expect(result.syncedRecords).toBe(2);
      expect(result.failedRecords).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
      expect(mockedDatabaseService.updateSyncStatus).toHaveBeenCalledTimes(2);
      expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle partial sync failures', async () => {
      // Mock online state
      mockedNetInfo.fetch.mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
      } as any);

      // Mock pending records
      mockedDatabaseService.getPendingVisits.mockResolvedValueOnce(mockPendingRecords);

      // Mock axios instance - first succeeds, second fails
      const mockAxiosInstance = {
        post: jest.fn()
          .mockResolvedValueOnce({
            status: 201,
            data: {},
          })
          .mockRejectedValueOnce({
            message: 'Network error',
          }),
      };
      mockedCreateAuthenticatedAxiosInstance.mockResolvedValueOnce(mockAxiosInstance as any);

      // Mock database update
      mockedDatabaseService.updateSyncStatus.mockResolvedValue();

      // Mock AsyncStorage
      mockedAsyncStorage.setItem.mockResolvedValue();

      const result = await syncManager.syncPendingRecords();

      expect(result.totalRecords).toBe(2);
      expect(result.syncedRecords).toBe(1);
      expect(result.failedRecords).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to sync record 2');
      expect(mockedDatabaseService.updateSyncStatus).toHaveBeenCalledTimes(1);
      expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should keep sync status as pending on failure', async () => {
      // Mock online state
      mockedNetInfo.fetch.mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
      } as any);

      // Mock pending records
      mockedDatabaseService.getPendingVisits.mockResolvedValueOnce([mockPendingRecords[0]]);

      // Mock axios instance - fails
      const mockAxiosInstance = {
        post: jest.fn().mockRejectedValueOnce({
          response: {
            data: {
              message: 'Server error',
            },
          },
        }),
      };
      mockedCreateAuthenticatedAxiosInstance.mockResolvedValueOnce(mockAxiosInstance as any);

      const result = await syncManager.syncPendingRecords();

      expect(result.totalRecords).toBe(1);
      expect(result.syncedRecords).toBe(0);
      expect(result.failedRecords).toBe(1);
      expect(result.errors[0]).toContain('Server error');
      expect(mockedDatabaseService.updateSyncStatus).not.toHaveBeenCalled();
    });

    it('should not update last sync time if no records synced', async () => {
      // Mock online state
      mockedNetInfo.fetch.mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
      } as any);

      // Mock pending records
      mockedDatabaseService.getPendingVisits.mockResolvedValueOnce([mockPendingRecords[0]]);

      // Mock axios instance - fails
      const mockAxiosInstance = {
        post: jest.fn().mockRejectedValueOnce({
          message: 'Network error',
        }),
      };
      mockedCreateAuthenticatedAxiosInstance.mockResolvedValueOnce(mockAxiosInstance as any);

      const result = await syncManager.syncPendingRecords();

      expect(result.syncedRecords).toBe(0);
      expect(mockedAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
