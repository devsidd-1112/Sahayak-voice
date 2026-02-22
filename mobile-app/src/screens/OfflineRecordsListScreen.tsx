/**
 * Offline Records List Screen
 * 
 * Displays all visit records stored in the local database.
 * Shows patient name, visit date, and sync status for each record.
 * Implements pull-to-refresh and manual sync functionality.
 * 
 * Requirements: 5.5, 6.6, 8.5
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getAllVisits} from '../services/database';
import {VisitRecord, SyncResult} from '../types';
import {RecordsListScreenNavigationProp} from '../navigation/types';
import {syncManager} from '../services/syncManager';

/**
 * Offline Records List Screen Component
 * 
 * Displays a list of all visit records with sync status indicators.
 * Provides pull-to-refresh and manual sync capabilities.
 */
const OfflineRecordsListScreen: React.FC = () => {
  const navigation = useNavigation<RecordsListScreenNavigationProp>();
  
  const [records, setRecords] = useState<VisitRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  /**
   * Load all visit records from the local database
   */
  const loadRecords = useCallback(async () => {
    try {
      const allRecords = await getAllVisits();
      setRecords(allRecords);
    } catch (error) {
      console.error('Error loading records:', error);
      Alert.alert(
        'Error | त्रुटि',
        'Failed to load records.\nरिकॉर्ड लोड करने में विफल।',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Check network connectivity status
   */
  const checkConnectivity = useCallback(async () => {
    const isConnected = await syncManager.checkConnectivity();
    setIsOnline(isConnected);
  }, []);

  /**
   * Initialize screen - load records and check connectivity
   */
  useEffect(() => {
    loadRecords();
    checkConnectivity();

    // Refresh connectivity status periodically
    const interval = setInterval(() => {
      checkConnectivity();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [loadRecords, checkConnectivity]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadRecords();
    checkConnectivity();
  }, [loadRecords, checkConnectivity]);

  /**
   * Handle manual sync button press
   * 
   * Requirements: 6.1, 6.5
   * - Connects sync button to SyncManager.syncPendingRecords
   * - Displays sync results (success/failure counts)
   * - Handles sync errors gracefully
   */
  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline | ऑफ़लाइन',
        'Cannot sync while offline. Please connect to the internet.\nऑफ़लाइन होने पर सिंक नहीं कर सकते। कृपया इंटरनेट से कनेक्ट करें।',
      );
      return;
    }

    const pendingRecords = records.filter(r => r.syncStatus === 'pending');
    if (pendingRecords.length === 0) {
      Alert.alert(
        'No Pending Records | कोई लंबित रिकॉर्ड नहीं',
        'All records are already synced.\nसभी रिकॉर्ड पहले से सिंक हैं।',
      );
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    try {
      // Call SyncManager to sync pending records
      const result = await syncManager.syncPendingRecords();
      setSyncResult(result);

      // Reload records to update sync status
      await loadRecords();

      // Display sync results
      if (result.errors.length > 0) {
        // Some records failed to sync
        Alert.alert(
          'Sync Completed with Errors | त्रुटियों के साथ सिंक पूर्ण',
          `Synced: ${result.syncedRecords}/${result.totalRecords}\nFailed: ${result.failedRecords}\n\nErrors:\n${result.errors.slice(0, 3).join('\n')}${result.errors.length > 3 ? '\n...' : ''}`,
          [{text: 'OK'}],
        );
      } else if (result.syncedRecords > 0) {
        // All records synced successfully
        Alert.alert(
          'Sync Successful | सिंक सफल',
          `Successfully synced ${result.syncedRecords} record(s).\n${result.syncedRecords} रिकॉर्ड सफलतापूर्वक सिंक किए गए।`,
          [{text: 'OK'}],
        );
      } else {
        // No records were synced
        Alert.alert(
          'Sync Failed | सिंक विफल',
          'No records were synced. Please try again.\nकोई रिकॉर्ड सिंक नहीं हुआ। कृपया पुनः प्रयास करें।',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      console.error('Error during sync:', error);
      Alert.alert(
        'Sync Error | सिंक त्रुटि',
        'An error occurred during sync. Please try again.\nसिंक के दौरान एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
        [{text: 'OK'}],
      );
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Get sync status icon
   */
  const getSyncStatusIcon = (status: 'pending' | 'synced'): string => {
    return status === 'synced' ? '✓' : '⏳';
  };

  /**
   * Get sync status color
   */
  const getSyncStatusColor = (status: 'pending' | 'synced'): string => {
    return status === 'synced' ? '#27ae60' : '#f39c12';
  };

  /**
   * Render individual record item
   */
  const renderRecordItem = ({item}: {item: VisitRecord}) => (
    <View style={styles.recordItem}>
      <View style={styles.recordContent}>
        <View style={styles.recordHeader}>
          <Text style={styles.patientName}>
            {item.patientName || 'Unknown Patient | अज्ञात रोगी'}
          </Text>
          <View
            style={[
              styles.syncStatusBadge,
              {backgroundColor: getSyncStatusColor(item.syncStatus)},
            ]}>
            <Text style={styles.syncStatusIcon}>
              {getSyncStatusIcon(item.syncStatus)}
            </Text>
          </View>
        </View>
        
        <View style={styles.recordDetails}>
          <Text style={styles.detailText}>
            📅 {formatDate(item.visitDate)}
          </Text>
          {item.bloodPressure && (
            <Text style={styles.detailText}>
              🩺 BP: {item.bloodPressure}
            </Text>
          )}
          {item.childSymptom && (
            <Text style={styles.detailText}>
              🤒 {item.childSymptom}
            </Text>
          )}
        </View>

        <Text style={styles.syncStatusText}>
          {item.syncStatus === 'synced'
            ? 'Synced | सिंक किया गया'
            : 'Pending Sync | सिंक लंबित'}
        </Text>
      </View>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Records Found</Text>
      <Text style={styles.emptySubtitle}>कोई रिकॉर्ड नहीं मिला</Text>
      <Text style={styles.emptyMessage}>
        Start recording visits to see them here.
      </Text>
      <Text style={styles.emptyMessage}>
        यहां देखने के लिए विज़िट रिकॉर्ड करना शुरू करें।
      </Text>
    </View>
  );

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading records...</Text>
        <Text style={styles.loadingText}>रिकॉर्ड लोड हो रहे हैं...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with sync button */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Visit Records</Text>
          <Text style={styles.headerSubtitle}>विज़िट रिकॉर्ड</Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>
            Total: {records.length}
          </Text>
          <Text style={styles.statsText}>
            Pending: {records.filter(r => r.syncStatus === 'pending').length}
          </Text>
        </View>
      </View>

      {/* Records list */}
      <FlatList
        data={records}
        renderItem={renderRecordItem}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={
          records.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      />

      {/* Sync button */}
      <View style={styles.footer}>
        <View style={styles.connectivityIndicator}>
          <View
            style={[
              styles.connectivityDot,
              {backgroundColor: isOnline ? '#27ae60' : '#e74c3c'},
            ]}
          />
          <Text style={styles.connectivityText}>
            {isOnline ? 'Online | ऑनलाइन' : 'Offline | ऑफ़लाइन'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.syncButton,
            (!isOnline || isSyncing) && styles.syncButtonDisabled,
          ]}
          onPress={handleSync}
          disabled={!isOnline || isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.syncButtonText}>
              🔄 Sync Now | अभी सिंक करें
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerInfo: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 2,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordContent: {
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  syncStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  syncStatusIcon: {
    fontSize: 18,
    color: '#fff',
  },
  recordDetails: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  syncStatusText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 20,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 4,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  connectivityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  connectivityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connectivityText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  syncButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  syncButtonDisabled: {
    backgroundColor: '#bdc3c7',
    elevation: 0,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OfflineRecordsListScreen;
