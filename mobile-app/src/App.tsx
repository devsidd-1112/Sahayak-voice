import React from 'react';
import {StatusBar} from 'react-native';
import {AppNavigator} from './navigation';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Main App Component
 * 
 * This is the entry point for the Sahayak Voice mobile application.
 * Sets up React Navigation with authentication flow and screen routing.
 * Wrapped with Error Boundary for graceful error handling.
 * 
 * Navigation Structure:
 * - Login Screen (initial route)
 * - Home Screen (after authentication)
 * - Voice Recording Screen
 * - Voice Confirmation Screen
 * - Records List Screen
 * - Sync Status Screen
 */
function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      <AppNavigator />
    </ErrorBoundary>
  );
}

export default App;
