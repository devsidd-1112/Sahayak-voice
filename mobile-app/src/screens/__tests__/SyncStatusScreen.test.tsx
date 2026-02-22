import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import SyncStatusScreen from '../SyncStatusScreen';
import {syncManager} from '../../services/syncManager';
import {SyncStatus, SyncResult} from '../../types';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock syncManager
jest.mock('../../services/syncManager', () => ({
  syncManager: {
    getSyncStatus: jest.fn(),
    syncPendingRecords: jest.fn(),
  },
}));

describe('SyncStatusScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sync status screen with all elements', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: '2024-01-20T10:00:00Z',
      pendingCount: 5,
      isOnline: true,
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText(/Sync Status/)).toBeTruthy();
      expect(getByText(/Connection/)).toBeTruthy();
      expect(getByText(/Last Sync/)).toBeTruthy();
      expect(getByText(/Records/)).toBeTruthy();
      expect(getByText(/Sync Now/)).toBeTruthy();
    });
  });

  it('should display online status when connected', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: null,
      pendingCount: 0,
      isOnline: true,
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText(/Online/)).toBeTruthy();
    });
  });

  it('should display offline status when not connected', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: null,
      pendingCount: 0,
      isOnline: false,
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText(/Offline/)).toBeTruthy();
    });
  });

  it('should display pending records count', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: null,
      pendingCount: 10,
      isOnline: true,
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText('10')).toBeTruthy();
      expect(getByText(/Pending/)).toBeTruthy();
    });
  });

  it('should trigger manual sync when button is pressed', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: null,
      pendingCount: 5,
      isOnline: true,
    };

    const mockSyncResult: SyncResult = {
      totalRecords: 5,
      syncedRecords: 5,
      failedRecords: 0,
      errors: [],
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);
    (syncManager.syncPendingRecords as jest.Mock).mockResolvedValue(mockSyncResult);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText(/Sync Now/)).toBeTruthy();
    });

    const syncButton = getByText(/Sync Now/);
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(syncManager.syncPendingRecords).toHaveBeenCalled();
    });
  });

  it('should display sync results after successful sync', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: null,
      pendingCount: 5,
      isOnline: true,
    };

    const mockSyncResult: SyncResult = {
      totalRecords: 5,
      syncedRecords: 4,
      failedRecords: 1,
      errors: ['Failed to sync record 3'],
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);
    (syncManager.syncPendingRecords as jest.Mock).mockResolvedValue(mockSyncResult);

    const {getByText, getAllByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText(/Sync Now/)).toBeTruthy();
    });

    const syncButton = getByText(/Sync Now/);
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(getByText(/Sync Result/)).toBeTruthy();
      expect(getAllByText('4').length).toBeGreaterThan(0); // Synced count
      expect(getByText(/Success/)).toBeTruthy();
    });
  });

  it('should display sync errors when sync fails', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: null,
      pendingCount: 5,
      isOnline: true,
    };

    const mockSyncResult: SyncResult = {
      totalRecords: 5,
      syncedRecords: 0,
      failedRecords: 5,
      errors: ['Network error', 'Authentication failed'],
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);
    (syncManager.syncPendingRecords as jest.Mock).mockResolvedValue(mockSyncResult);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText(/Sync Now/)).toBeTruthy();
    });

    const syncButton = getByText(/Sync Now/);
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(getByText(/Errors/)).toBeTruthy();
      expect(getByText(/Network error/)).toBeTruthy();
      expect(getByText(/Authentication failed/)).toBeTruthy();
    });
  });

  it('should disable sync button when offline', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: null,
      pendingCount: 5,
      isOnline: false,
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText(/Connect to internet/)).toBeTruthy();
    });

    // Verify sync was not called when button is disabled
    const syncButton = getByText(/Sync Now/);
    fireEvent.press(syncButton);
    
    expect(syncManager.syncPendingRecords).not.toHaveBeenCalled();
  });

  it('should disable sync button when no pending records', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: '2024-01-20T10:00:00Z',
      pendingCount: 0,
      isOnline: true,
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText(/All records are synced/)).toBeTruthy();
    });

    // Verify sync was not called when button is disabled
    const syncButton = getByText(/Sync Now/);
    fireEvent.press(syncButton);
    
    expect(syncManager.syncPendingRecords).not.toHaveBeenCalled();
  });

  it('should format last sync time correctly', async () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    const mockSyncStatus: SyncStatus = {
      lastSyncTime: fiveMinutesAgo,
      pendingCount: 0,
      isOnline: true,
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText(/5 min ago/)).toBeTruthy();
    });
  });

  it('should navigate back when back button is pressed', async () => {
    const mockSyncStatus: SyncStatus = {
      lastSyncTime: null,
      pendingCount: 0,
      isOnline: true,
    };

    (syncManager.getSyncStatus as jest.Mock).mockResolvedValue(mockSyncStatus);

    const {getByText} = render(<SyncStatusScreen />);

    await waitFor(() => {
      expect(getByText('←')).toBeTruthy();
    });

    const backButton = getByText('←');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });
});
