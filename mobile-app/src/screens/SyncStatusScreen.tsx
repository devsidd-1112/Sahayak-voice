import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {syncManager} from '../services/syncManager';
import {SyncStatus, SyncResult} from '../types';

/**
 * Sync Status Screen Component
 * 
 * Displays synchronization status and allows manual sync trigger.
 * Features:
 * - Last sync time display
 * - Pending records count
 * - Synced records count (from last sync)
 * - Connectivity status (online/offline)
 * - Manual sync trigger button
 * - Sync progress indicator
 * - Sync error messages
 * 
 * Requirements: 8.6
 */

const SyncStatusScreen: React.FC = () => {
  const navigation = useNavigation();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    pendingCount: 0,
    isOnline: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Load sync status on mount and refresh periodically
  useEffect(() => {
    loadSyncStatus();
    
    const interval = setInterval(() => {
      loadSyncStatus();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await syncManager.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const handleManualSync = async () => {
    if (!syncStatus.isOnline) {
      return; // Don't sync if offline
    }

    if (syncStatus.pendingCount === 0) {
      return; // No records to sync
    }

    setIsSyncing(true);
    setShowResult(false);
    setSyncResult(null);

    try {
      const result = await syncManager.syncPendingRecords();
      setSyncResult(result);
      setShowResult(true);
      
      // Reload sync status to update pending count
      await loadSyncStatus();
    } catch (error) {
      console.error('Error during sync:', error);
      setSyncResult({
        totalRecords: 0,
        syncedRecords: 0,
        failedRecords: 0,
        errors: ['Sync failed. Please try again.'],
      });
      setShowResult(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSyncTime = (timestamp: string | null): string => {
    if (!timestamp) {
      return 'Never / कभी नहीं';
    }

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        return 'Just now / अभी';
      } else if (diffMins < 60) {
        return `${diffMins} min ago / ${diffMins} मिनट पहले`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago / ${diffHours} घंटे पहले`;
      } else {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago / ${diffDays} दिन पहले`;
      }
    } catch (error) {
      return 'Unknown / अज्ञात';
    }
  };

  const getSyncButtonDisabled = (): boolean => {
    return !syncStatus.isOnline || syncStatus.pendingCount === 0 || isSyncing;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ecf0f1" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sync Status / सिंक स्थिति</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* Connectivity Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 Connection / कनेक्शन</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                syncStatus.isOnline ? styles.statusDotOnline : styles.statusDotOffline,
              ]}
            />
            <Text style={styles.statusText}>
              {syncStatus.isOnline ? 'Online / ऑनलाइन' : 'Offline / ऑफ़लाइन'}
            </Text>
          </View>
        </View>

        {/* Last Sync Time Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🕐 Last Sync / अंतिम सिंक</Text>
          <Text style={styles.syncTimeText}>
            {formatLastSyncTime(syncStatus.lastSyncTime)}
          </Text>
        </View>

        {/* Records Count Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Records / रिकॉर्ड</Text>
          
          <View style={styles.countRow}>
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>Pending / लंबित</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.countValue}>{syncStatus.pendingCount}</Text>
              </View>
            </View>
            
            {showResult && syncResult && (
              <View style={styles.countItem}>
                <Text style={styles.countLabel}>Synced / सिंक किया</Text>
                <View style={styles.syncedBadge}>
                  <Text style={styles.countValue}>{syncResult.syncedRecords}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Sync Result Card */}
        {showResult && syncResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {syncResult.errors.length > 0 ? '⚠️ Sync Result / सिंक परिणाम' : '✅ Sync Result / सिंक परिणाम'}
            </Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total / कुल:</Text>
              <Text style={styles.resultValue}>{syncResult.totalRecords}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Success / सफल:</Text>
              <Text style={[styles.resultValue, styles.successText]}>
                {syncResult.syncedRecords}
              </Text>
            </View>
            
            {syncResult.failedRecords > 0 && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Failed / असफल:</Text>
                <Text style={[styles.resultValue, styles.errorText]}>
                  {syncResult.failedRecords}
                </Text>
              </View>
            )}

            {/* Error Messages */}
            {syncResult.errors.length > 0 && (
              <View style={styles.errorsContainer}>
                <Text style={styles.errorsTitle}>Errors / त्रुटियाँ:</Text>
                {syncResult.errors.map((error, index) => (
                  <Text key={index} style={styles.errorMessage}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Manual Sync Button */}
        <TouchableOpacity
          style={[
            styles.syncButton,
            getSyncButtonDisabled() && styles.syncButtonDisabled,
          ]}
          onPress={handleManualSync}
          disabled={getSyncButtonDisabled()}
          activeOpacity={0.8}>
          {isSyncing ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Text style={styles.syncButtonIcon}>🔄</Text>
              <Text style={styles.syncButtonText}>
                Sync Now{'\n'}अभी सिंक करें
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Helper Text */}
        {!syncStatus.isOnline && (
          <Text style={styles.helperText}>
            Connect to internet to sync records{'\n'}
            रिकॉर्ड सिंक करने के लिए इंटरनेट से कनेक्ट करें
          </Text>
        )}

        {syncStatus.isOnline && syncStatus.pendingCount === 0 && (
          <Text style={styles.helperText}>
            All records are synced{'\n'}
            सभी रिकॉर्ड सिंक हो गए हैं
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#2c3e50',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  statusDotOnline: {
    backgroundColor: '#27ae60',
  },
  statusDotOffline: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
  },
  syncTimeText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  countItem: {
    alignItems: 'center',
  },
  countLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#3498db',
    borderRadius: 30,
    minWidth: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  syncedBadge: {
    backgroundColor: '#27ae60',
    borderRadius: 30,
    minWidth: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  countValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  resultLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  successText: {
    color: '#27ae60',
  },
  errorText: {
    color: '#e74c3c',
  },
  errorsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c0392b',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#c0392b',
    marginVertical: 2,
    lineHeight: 20,
  },
  syncButton: {
    backgroundColor: '#27ae60',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#27ae60',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  syncButtonDisabled: {
    backgroundColor: '#95a5a6',
    shadowColor: '#95a5a6',
  },
  syncButtonIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  helperText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
});

export default SyncStatusScreen;
