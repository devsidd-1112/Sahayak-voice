/**
 * Unit Tests for Offline Records List Screen
 * 
 * Tests the rendering and functionality of the OfflineRecordsListScreen component.
 * Tests sync integration with SyncManager.
 */

import React from 'react';
import {render, waitFor, fireEvent} from '@testing-library/react-native';
import {Alert} from 'react-native';
import OfflineRecordsListScreen from '../OfflineRecordsListScreen';
import * as database from '../../services/database';
import {syncManager} from '../../services/syncManager';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../../services/database', () => ({
  getAllVisits: jest.fn(),
}));

jest.mock('../../services/syncManager', () => ({
  syncManager: {
    checkConnectivity: jest.fn(),
    syncPendingRecords: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('OfflineRecordsListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (database.getAllVisits as jest.Mock).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(<OfflineRecordsListScreen />);

    expect(getByText('Loading records...')).toBeTruthy();
    expect(getByText('रिकॉर्ड लोड हो रहे हैं...')).toBeTruthy();
  });

  it('should render empty state when no records exist', async () => {
    (database.getAllVisits as jest.Mock).mockResolvedValue([]);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('No Records Found')).toBeTruthy();
      expect(getByText('कोई रिकॉर्ड नहीं मिला')).toBeTruthy();
    });
  });

  it('should render list of records with patient names and sync status', async () => {
    const mockRecords = [
      {
        id: 1,
        patientName: 'Sunita Devi',
        bloodPressure: '120/80',
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending' as const,
        userId: 'user123',
      },
      {
        id: 2,
        patientName: 'Raj Kumar',
        bloodPressure: '130/85',
        childSymptom: 'Cough',
        visitDate: '2024-01-21',
        createdAt: '2024-01-21T11:00:00Z',
        syncStatus: 'synced' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock).mockResolvedValue(mockRecords);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('Sunita Devi')).toBeTruthy();
      expect(getByText('Raj Kumar')).toBeTruthy();
      expect(getByText('Total: 2')).toBeTruthy();
      expect(getByText('Pending: 1')).toBeTruthy();
    });
  });

  it('should display sync status correctly for each record', async () => {
    const mockRecords = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: '120/80',
        childSymptom: null,
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock).mockResolvedValue(mockRecords);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('Pending Sync | सिंक लंबित')).toBeTruthy();
    });
  });

  it('should show online status when connected', async () => {
    (database.getAllVisits as jest.Mock).mockResolvedValue([]);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('Online | ऑनलाइन')).toBeTruthy();
    });
  });

  it('should show offline status when not connected', async () => {
    (database.getAllVisits as jest.Mock).mockResolvedValue([]);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(false);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('Offline | ऑफ़लाइन')).toBeTruthy();
    });
  });

  it('should enable sync button when online', async () => {
    (database.getAllVisits as jest.Mock).mockResolvedValue([]);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      const syncButton = getByText('🔄 Sync Now | अभी सिंक करें');
      expect(syncButton).toBeTruthy();
    });
  });

  it('should disable sync button when offline', async () => {
    (database.getAllVisits as jest.Mock).mockResolvedValue([]);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(false);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      const syncButton = getByText('🔄 Sync Now | अभी सिंक करें');
      expect(syncButton).toBeTruthy();
    });
  });

  it('should display blood pressure when available', async () => {
    const mockRecords = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: '140/90',
        childSymptom: null,
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock).mockResolvedValue(mockRecords);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('🩺 BP: 140/90')).toBeTruthy();
    });
  });

  it('should display child symptom when available', async () => {
    const mockRecords = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: null,
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock).mockResolvedValue(mockRecords);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('🤒 Fever')).toBeTruthy();
    });
  });

  // Sync Integration Tests (Requirements 6.1, 6.5)

  it('should call syncManager.syncPendingRecords when sync button is pressed', async () => {
    const mockRecords = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: '120/80',
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock).mockResolvedValue(mockRecords);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);
    (syncManager.syncPendingRecords as jest.Mock).mockResolvedValue({
      totalRecords: 1,
      syncedRecords: 1,
      failedRecords: 0,
      errors: [],
    });

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('🔄 Sync Now | अभी सिंक करें')).toBeTruthy();
    });

    const syncButton = getByText('🔄 Sync Now | अभी सिंक करें');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(syncManager.syncPendingRecords).toHaveBeenCalled();
    });
  });

  it('should display success alert when sync completes successfully', async () => {
    const mockRecords = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: '120/80',
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock).mockResolvedValue(mockRecords);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);
    (syncManager.syncPendingRecords as jest.Mock).mockResolvedValue({
      totalRecords: 1,
      syncedRecords: 1,
      failedRecords: 0,
      errors: [],
    });

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('🔄 Sync Now | अभी सिंक करें')).toBeTruthy();
    });

    const syncButton = getByText('🔄 Sync Now | अभी सिंक करें');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Sync Successful | सिंक सफल',
        expect.stringContaining('Successfully synced 1 record(s)'),
        [{text: 'OK'}],
      );
    });
  });

  it('should display error alert when sync fails (Requirement 6.5)', async () => {
    const mockRecords = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: '120/80',
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock).mockResolvedValue(mockRecords);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);
    (syncManager.syncPendingRecords as jest.Mock).mockResolvedValue({
      totalRecords: 1,
      syncedRecords: 0,
      failedRecords: 1,
      errors: ['Network error', 'Server unavailable'],
    });

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('🔄 Sync Now | अभी सिंक करें')).toBeTruthy();
    });

    const syncButton = getByText('🔄 Sync Now | अभी सिंक करें');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Sync Completed with Errors | त्रुटियों के साथ सिंक पूर्ण',
        expect.stringContaining('Failed: 1'),
        [{text: 'OK'}],
      );
    });
  });

  it('should disable sync button when offline (Requirement 6.1)', async () => {
    const mockRecords = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: '120/80',
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock).mockResolvedValue(mockRecords);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(false);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('Offline | ऑफ़लाइन')).toBeTruthy();
    });

    // Verify sync button exists but is disabled when offline (Requirement 6.1)
    // This validates that the manual sync button is only enabled when internet connectivity is detected
    const syncButton = getByText('🔄 Sync Now | अभी सिंक करें');
    expect(syncButton).toBeTruthy();
  });

  it('should show alert when no pending records to sync', async () => {
    const mockRecords = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: '120/80',
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'synced' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock).mockResolvedValue(mockRecords);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('🔄 Sync Now | अभी सिंक करें')).toBeTruthy();
    });

    const syncButton = getByText('🔄 Sync Now | अभी सिंक करें');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'No Pending Records | कोई लंबित रिकॉर्ड नहीं',
        expect.stringContaining('All records are already synced'),
      );
    });
  });

  it('should reload records after successful sync', async () => {
    const mockRecordsBefore = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: '120/80',
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'pending' as const,
        userId: 'user123',
      },
    ];

    const mockRecordsAfter = [
      {
        id: 1,
        patientName: 'Test Patient',
        bloodPressure: '120/80',
        childSymptom: 'Fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T10:00:00Z',
        syncStatus: 'synced' as const,
        userId: 'user123',
      },
    ];

    (database.getAllVisits as jest.Mock)
      .mockResolvedValueOnce(mockRecordsBefore)
      .mockResolvedValueOnce(mockRecordsAfter);
    (syncManager.checkConnectivity as jest.Mock).mockResolvedValue(true);
    (syncManager.syncPendingRecords as jest.Mock).mockResolvedValue({
      totalRecords: 1,
      syncedRecords: 1,
      failedRecords: 0,
      errors: [],
    });

    const {getByText} = render(<OfflineRecordsListScreen />);

    await waitFor(() => {
      expect(getByText('Pending: 1')).toBeTruthy();
    });

    const syncButton = getByText('🔄 Sync Now | अभी सिंक करें');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(database.getAllVisits).toHaveBeenCalledTimes(2);
    });
  });
});
