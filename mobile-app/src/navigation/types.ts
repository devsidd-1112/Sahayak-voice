import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

/**
 * Root Stack Parameter List
 * 
 * Defines all routes in the application and their parameters.
 * This ensures type-safe navigation throughout the app.
 */
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  VoiceRecording: undefined;
  VoiceConfirmation: {
    extractedData: {
      patientName: string | null;
      bloodPressure: string | null;
      childSymptom: string | null;
      visitDate: string;
    };
  };
  RecordsList: undefined;
  SyncStatus: undefined;
};

/**
 * Navigation Prop Types
 * 
 * Type definitions for navigation props used in screen components.
 */
export type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

export type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type VoiceRecordingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VoiceRecording'
>;

export type VoiceConfirmationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VoiceConfirmation'
>;

export type RecordsListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RecordsList'
>;

export type SyncStatusScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SyncStatus'
>;

/**
 * Route Prop Types
 * 
 * Type definitions for route props used in screen components.
 */
export type VoiceConfirmationScreenRouteProp = RouteProp<
  RootStackParamList,
  'VoiceConfirmation'
>;
