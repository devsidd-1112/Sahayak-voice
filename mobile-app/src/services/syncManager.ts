/**
 * Sync Manager Service
 * 
 * Handles connectivity detection and provides sync status information.
 * Manages synchronization of local visit records with the backend server.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SyncStatus, SyncResult, VisitRecord} from '../types';
import {databaseService} from './database';
import {createAuthenticatedAxiosInstance} from './auth';
import {API_ENDPOINTS} from '../config/api';

// AsyncStorage key for last sync time
const LAST_SYNC_TIME_KEY = '@sahayak_last_sync_time';

/**
 * Sync Manager Class
 * 
 * Provides methods for connectivity detection and sync status tracking.
 */
class SyncManager {
  /**
   * Check network connectivity
   * 
   * @returns Promise<boolean> True if connected to the internet, false otherwise
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      const netInfoState = await NetInfo.fetch();
      const isConnected = netInfoState.isConnected && netInfoState.isInternetReachable;
      
      console.log('Network connectivity check:', {
        isConnected: netInfoState.isConnected,
        isInternetReachable: netInfoState.isInternetReachable,
        result: isConnected,
      });
      
      return isConnected ?? false;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return false;
    }
  }

  /**
   * Get current sync status
   * 
   * @returns Promise<SyncStatus> Object containing sync status information
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      // Check connectivity
      const isOnline = await this.checkConnectivity();
      
      // Get last sync time from AsyncStorage
      const lastSyncTime = await AsyncStorage.getItem(LAST_SYNC_TIME_KEY);
      
      // Get pending record count from database
      const pendingVisits = await databaseService.getPendingVisits();
      const pendingCount = pendingVisits.length;
      
      const syncStatus: SyncStatus = {
        lastSyncTime: lastSyncTime,
        pendingCount: pendingCount,
        isOnline: isOnline,
      };
      
      console.log('Sync status:', syncStatus);
      
      return syncStatus;
    } catch (error) {
      console.error('Error getting sync status:', error);
      
      // Return default status on error
      return {
        lastSyncTime: null,
        pendingCount: 0,
        isOnline: false,
      };
    }
  }

  /**
   * Update last sync time in AsyncStorage
   * 
   * @param timestamp ISO timestamp string
   * @returns Promise<void>
   */
  async updateLastSyncTime(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_SYNC_TIME_KEY, timestamp);
      console.log('Last sync time updated:', timestamp);
    } catch (error) {
      console.error('Error updating last sync time:', error);
      throw new Error(`Failed to update last sync time: ${error}`);
    }
  }

  /**
   * Clear last sync time from AsyncStorage
   * 
   * @returns Promise<void>
   */
  async clearLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LAST_SYNC_TIME_KEY);
      console.log('Last sync time cleared');
    } catch (error) {
      console.error('Error clearing last sync time:', error);
      throw new Error(`Failed to clear last sync time: ${error}`);
    }
  }

  /**
   * Sync pending records to backend
   * 
   * Retrieves all pending visit records from local database and syncs them
   * to the backend server. Updates sync status for successfully synced records.
   * 
   * Requirements: 6.2, 6.3, 6.4, 6.5
   * 
   * @returns Promise<SyncResult> Object containing sync results with counts and errors
   */
  async syncPendingRecords(): Promise<SyncResult> {
    const result: SyncResult = {
      totalRecords: 0,
      syncedRecords: 0,
      failedRecords: 0,
      errors: [],
    };

    try {
      // Check network connectivity first
      const isOnline = await this.checkConnectivity();
      
      if (!isOnline) {
        const errorMsg = 'No internet connection available';
        console.log('Sync aborted:', errorMsg);
        result.errors.push(errorMsg);
        return result;
      }

      // Get all pending records from local database
      const pendingRecords = await databaseService.getPendingVisits();
      result.totalRecords = pendingRecords.length;

      console.log(`Starting sync for ${result.totalRecords} pending records`);

      // If no pending records, return early
      if (result.totalRecords === 0) {
        console.log('No pending records to sync');
        return result;
      }

      // Create authenticated axios instance
      const axiosInstance = await createAuthenticatedAxiosInstance();

      // Sync each record individually
      for (const record of pendingRecords) {
        try {
          // Prepare record for backend (exclude local id)
          const recordToSync: Partial<VisitRecord> = {
            patientName: record.patientName,
            bloodPressure: record.bloodPressure,
            childSymptom: record.childSymptom,
            visitDate: record.visitDate,
            createdAt: record.createdAt,
            userId: record.userId,
          };

          // Send POST request to sync endpoint
          const response = await axiosInstance.post(
            API_ENDPOINTS.VISITS.SYNC,
            recordToSync
          );

          // Check if sync was successful (201 Created or 200 OK)
          if (response.status === 201 || response.status === 200) {
            // Update local sync status to 'synced'
            if (record.id) {
              await databaseService.updateSyncStatus(record.id, 'synced');
              result.syncedRecords++;
              console.log(`Successfully synced record ${record.id}`);
            }
          } else {
            // Unexpected status code
            result.failedRecords++;
            const errorMsg = `Unexpected response status ${response.status} for record ${record.id}`;
            result.errors.push(errorMsg);
            console.error(errorMsg);
          }
        } catch (error: any) {
          // Sync failed for this record, keep status as 'pending'
          result.failedRecords++;
          
          const errorMsg = error.response?.data?.message 
            || error.message 
            || 'Unknown error';
          
          const recordError = `Failed to sync record ${record.id}: ${errorMsg}`;
          result.errors.push(recordError);
          console.error(recordError);
          
          // Continue to next record instead of stopping
          continue;
        }
      }

      // Update last sync time if at least one record was synced successfully
      if (result.syncedRecords > 0) {
        const now = new Date().toISOString();
        await this.updateLastSyncTime(now);
      }

      console.log('Sync complete:', {
        total: result.totalRecords,
        synced: result.syncedRecords,
        failed: result.failedRecords,
      });

      return result;
    } catch (error: any) {
      // Handle unexpected errors during sync process
      const errorMsg = `Sync process failed: ${error.message || 'Unknown error'}`;
      console.error(errorMsg);
      result.errors.push(errorMsg);
      return result;
    }
  }
}

// Export a singleton instance
export const syncManager = new SyncManager();

// Export the class for testing purposes
export default SyncManager;

// Export convenience functions for direct use
export const checkConnectivity = () => syncManager.checkConnectivity();
export const getSyncStatus = () => syncManager.getSyncStatus();
export const updateLastSyncTime = (timestamp: string) => syncManager.updateLastSyncTime(timestamp);
export const clearLastSyncTime = () => syncManager.clearLastSyncTime();
export const syncPendingRecords = () => syncManager.syncPendingRecords();
