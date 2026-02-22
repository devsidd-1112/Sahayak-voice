import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import VoiceRecordingScreen from '../screens/VoiceRecordingScreen';
import VoiceConfirmationScreen from '../screens/VoiceConfirmationScreen';
import OfflineRecordsListScreen from '../screens/OfflineRecordsListScreen';
import SyncStatusScreen from '../screens/SyncStatusScreen';
import {RootStackParamList} from './types';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Main App Navigator
 * 
 * Configures the navigation stack for the Sahayak Voice mobile application.
 * Implements authentication flow with navigation guards.
 * 
 * Features:
 * - Authentication guard: Checks for valid token before allowing access to protected screens
 * - Automatic redirect to Login if not authenticated
 * - Prevents back navigation to Login after successful authentication
 * 
 * Routes:
 * - Login: Initial authentication screen (public)
 * - Home: Main screen after successful login (protected)
 * - VoiceRecording: Voice input capture screen (protected)
 * - VoiceConfirmation: Data confirmation screen (protected)
 * - RecordsList: Offline records list screen (protected)
 * - SyncStatus: Synchronization status screen (protected)
 * 
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.6
 */
const AppNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is authenticated by verifying stored token
   * This implements the authentication guard
   */
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false, // Hide header on login screen
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Sahayak Voice',
            headerLeft: () => null, // Prevent back navigation to login
            gestureEnabled: false, // Disable swipe back gesture on iOS
          }}
        />
        <Stack.Screen
          name="VoiceRecording"
          component={VoiceRecordingScreen}
          options={{
            headerShown: false, // Hide header on recording screen for full-screen experience
          }}
        />
        <Stack.Screen
          name="VoiceConfirmation"
          component={VoiceConfirmationScreen}
          options={{
            headerShown: false, // Hide header on confirmation screen for full-screen experience
          }}
        />
        <Stack.Screen
          name="RecordsList"
          component={OfflineRecordsListScreen}
          options={{
            title: 'Visit Records | विज़िट रिकॉर्ड',
          }}
        />
        <Stack.Screen
          name="SyncStatus"
          component={SyncStatusScreen}
          options={{
            headerShown: false, // Hide header, using custom header in component
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
