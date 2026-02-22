/**
 * Error Boundary Component
 * 
 * React Error Boundary to catch and handle component-level errors gracefully.
 * Prevents the entire app from crashing when a component throws an error.
 * 
 * Features:
 * - Catches JavaScript errors in child component tree
 * - Displays user-friendly error screen with bilingual messages
 * - Provides "Try Again" button to reset error state
 * - Logs errors for debugging
 * 
 * Requirements: Error Handling section - React Error Boundaries
 */

import React, {Component, ErrorInfo, ReactNode} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * Log error details when an error is caught
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  /**
   * Reset error state and try rendering again
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Error Icon */}
            <Text style={styles.errorIcon}>⚠️</Text>

            {/* Error Title */}
            <Text style={styles.errorTitle}>
              Something Went Wrong
            </Text>
            <Text style={styles.errorTitleHindi}>
              कुछ गलत हो गया
            </Text>

            {/* Error Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.errorMessage}>
                The app encountered an unexpected error. Please try again.
              </Text>
              <Text style={styles.errorMessageHindi}>
                ऐप में एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।
              </Text>
            </View>

            {/* Error Details (for debugging) */}
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            {/* Try Again Button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={this.handleReset}
              activeOpacity={0.8}>
              <Text style={styles.resetButtonText}>
                🔄 Try Again / पुनः प्रयास करें
              </Text>
            </TouchableOpacity>

            {/* Helper Text */}
            <Text style={styles.helperText}>
              If the problem persists, please restart the app.
            </Text>
            <Text style={styles.helperTextHindi}>
              यदि समस्या बनी रहती है, तो कृपया ऐप को पुनः प्रारंभ करें।
            </Text>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorTitleHindi: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorMessage: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  errorMessageHindi: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 24,
  },
  debugContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#27ae60',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 4,
  },
  helperTextHindi: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default ErrorBoundary;
