import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {HomeScreenNavigationProp} from '../navigation/types';
import {syncManager} from '../services/syncManager';

/**
 * Home Screen Component
 * 
 * Main screen after login for ASHA workers.
 * Features:
 * - Large circular "Record Visit" button with microphone icon
 * - Sync status indicator (online/offline, pending count)
 * - Navigation button to "View Records" screen
 * - Logout button
 * - Hardware back button handling (Android)
 * 
 * Requirements: 8.2, 8.3
 */

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [userName, setUserName] = useState('ASHA Worker');
  const [isOnline, setIsOnline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Load user info and sync status on mount
  useEffect(() => {
    loadUserInfo();
    loadSyncStatus();
  }, []);

  // Reload sync status when screen is focused and periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadSyncStatus();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, []);

  /**
   * Handle hardware back button press on Android
   * Prevents accidental exit from the app by showing confirmation dialog
   */
  const handleBackPress = (): boolean => {
    Alert.alert(
      'Exit App / ऐप से बाहर निकलें',
      'Do you want to exit the app?\nक्या आप ऐप से बाहर निकलना चाहते हैं?',
      [
        {
          text: 'Cancel / रद्द करें',
          style: 'cancel',
        },
        {
          text: 'Exit / बाहर निकलें',
          style: 'destructive',
          onPress: () => BackHandler.exitApp(),
        },
      ],
    );
    return true; // Prevent default back behavior
  };

  const loadUserInfo = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserName(user.name || 'ASHA Worker');
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const status = await syncManager.getSyncStatus();
      setIsOnline(status.isOnline);
      setPendingCount(status.pendingCount);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const handleRecordVisit = () => {
    navigation.navigate('VoiceRecording');
  };

  const handleViewRecords = () => {
    navigation.navigate('RecordsList');
  };

  const handleViewSyncStatus = () => {
    navigation.navigate('SyncStatus');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout / लॉगआउट',
      'Are you sure you want to logout?\nक्या आप लॉगआउट करना चाहते हैं?',
      [
        {
          text: 'Cancel / रद्द करें',
          style: 'cancel',
        },
        {
          text: 'Logout / लॉगआउट',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear stored user data
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('token');
              
              // Navigate back to Login screen
              navigation.replace('Login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ecf0f1" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>नमस्ते / Hello</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Status Indicator */}
      <View style={styles.syncStatusContainer}>
        <TouchableOpacity
          style={styles.syncStatusCard}
          onPress={handleViewSyncStatus}
          activeOpacity={0.7}>
          <View style={styles.syncStatusRow}>
            <View style={styles.connectionStatus}>
              <View
                style={[
                  styles.statusDot,
                  isOnline ? styles.statusDotOnline : styles.statusDotOffline,
                ]}
              />
              <Text style={styles.connectionText}>
                {isOnline ? '🌐 Online / ऑनलाइन' : '📵 Offline / ऑफ़लाइन'}
              </Text>
            </View>
          </View>
          
          <View style={styles.syncStatusRow}>
            <Text style={styles.pendingLabel}>
              📋 Pending Records / लंबित रिकॉर्ड:
            </Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingCount}>{pendingCount}</Text>
            </View>
          </View>
          
          <Text style={styles.tapToViewText}>
            Tap to view sync details / सिंक विवरण देखने के लिए टैप करें
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Large Record Visit Button */}
        <TouchableOpacity
          style={styles.recordButton}
          onPress={handleRecordVisit}
          activeOpacity={0.8}>
          <View style={styles.recordButtonInner}>
            <Text style={styles.microphoneIcon}>🎤</Text>
            <Text style={styles.recordButtonText}>Record Visit</Text>
            <Text style={styles.recordButtonTextHindi}>विज़िट रिकॉर्ड करें</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.instructionText}>
          Tap to start voice recording{'\n'}
          वॉइस रिकॉर्डिंग शुरू करने के लिए टैप करें
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* View Records Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleViewRecords}
          activeOpacity={0.7}>
          <Text style={styles.navButtonIcon}>📂</Text>
          <Text style={styles.navButtonText}>
            View Records{'\n'}रिकॉर्ड देखें
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  greeting: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  syncStatusContainer: {
    padding: 20,
  },
  syncStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusDotOnline: {
    backgroundColor: '#27ae60',
  },
  statusDotOffline: {
    backgroundColor: '#e74c3c',
  },
  connectionText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  pendingLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    minWidth: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  pendingCount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tapToViewText: {
    fontSize: 14,
    color: '#3498db',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  recordButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  recordButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recordButtonTextHindi: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  instructionText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 24,
  },
  bottomNav: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#3498db',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navButtonIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
});

export default HomeScreen;
