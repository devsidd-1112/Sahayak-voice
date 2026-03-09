import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {LoginScreenNavigationProp} from '../navigation/types';
import {login} from '../services/auth';

/**
 * Login Screen Component
 * 
 * Provides user authentication interface for ASHA workers.
 * Features:
 * - Phone number input field
 * - Password input field
 * - Login button
 * - Error message display
 * - Form validation
 * - Integration with authentication API
 * - Navigation to Home screen on successful login
 * 
 * Requirements: 1.1, 1.2, 8.1, 8.2
 */

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    setError('');

    if (!phoneNumber.trim()) {
      setError('कृपया फ़ोन नंबर दर्ज करें / Please enter phone number');
      return false;
    }

    // Basic phone number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setError('कृपया वैध 10 अंकों का फ़ोन नंबर दर्ज करें / Please enter valid 10-digit phone number');
      return false;
    }

    if (!password.trim()) {
      setError('कृपया पासवर्ड दर्ज करें / Please enter password');
      return false;
    }

    if (password.length < 4) {
      setError('पासवर्ड कम से कम 4 अक्षर का होना चाहिए / Password must be at least 4 characters');
      return false;
    }

    return true;
  };

  // Handle login button press
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call authentication API
      await login(phoneNumber.trim(), password);
      
      // On success, navigate to Home screen
      navigation.replace('Home');
    } catch (err: any) {
      // Display error message
      const errorMessage = err.message || 'लॉगिन विफल / Login failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* App Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Sahayak Voice</Text>
          <Text style={styles.subtitle}>सहायक वॉइस</Text>
          <Text style={styles.description}>
            ASHA Worker Login{'\n'}आशा कार्यकर्ता लॉगिन
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              📱 Phone Number / फ़ोन नंबर
            </Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit phone number"
              placeholderTextColor="#95a5a6"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              🔒 Password / पासवर्ड
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#95a5a6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Error Message Display */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>
                Login / लॉगिन करें
              </Text>
            )}
          </TouchableOpacity>

          {/* Signup Link */}
          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate('Signup')}
            disabled={isLoading}>
            <Text style={styles.signupLinkText}>
              Don't have an account? Sign Up / खाता नहीं है? साइन अप करें
            </Text>
          </TouchableOpacity>
        </View>

        {/* Helper Text */}
        <View style={styles.footer}>
          <Text style={styles.helperText}>
            For demo: Use any 10-digit phone number{'\n'}
            डेमो के लिए: कोई भी 10 अंकों का फ़ोन नंबर उपयोग करें
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#2c3e50',
    backgroundColor: '#fff',
  },
  errorContainer: {
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 15,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#27ae60',
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#27ae60',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#95a5a6',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupLinkText: {
    color: '#3498db',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  helperText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;
