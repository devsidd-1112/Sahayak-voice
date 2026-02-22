/**
 * Type Definitions
 * 
 * Central type definitions for the Sahayak Voice mobile application
 */

// User types
export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  token: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
}

// Visit Record types
export interface VisitRecord {
  id?: number; // Local database ID
  patientName: string | null;
  bloodPressure: string | null;
  childSymptom: string | null;
  visitDate: string; // ISO date string
  createdAt: string; // ISO timestamp
  syncStatus: 'pending' | 'synced';
  userId: string;
}

// Sync types
export interface SyncResult {
  totalRecords: number;
  syncedRecords: number;
  failedRecords: number;
  errors: string[];
}

export interface SyncStatus {
  lastSyncTime: string | null;
  pendingCount: number;
  isOnline: boolean;
}

// Voice Input types
export type Language = 'hi' | 'en';

export interface VoiceInputResult {
  text: string;
  language: Language;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  VoiceRecording: undefined;
  VoiceConfirmation: {record: VisitRecord};
  RecordsList: undefined;
  SyncStatus: undefined;
};
