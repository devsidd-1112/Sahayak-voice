import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {OTPVerificationScreenNavigationProp, OTPVerificationScreenRouteProp} from '../navigation/types';
import {verifyOtp, resendOtp} from '../services/auth';

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const {phoneNumber, name} = route.params;
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const validateOtp = (): boolean => {
    setError('');

    if (!otp.trim()) {
      setError('कृपया OTP दर्ज करें / Please enter OTP');
      return false;
    }

    if (otp.trim().length !== 6) {
      setError('OTP 6 अंकों का होना चाहिए / OTP must be 6 digits');
      return false;
    }

    return true;
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyOtp(phoneNumber, otp.trim());
      
      // Show success message
      Alert.alert(
        'Success / सफलता',
        'Account created successfully! / खाता सफलतापूर्वक बनाया गया!',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Home'),
          },
        ]
      );
    } catch (err: any) {
      const errorMessage = err.message || 'OTP सत्यापन विफल / OTP verification failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');

    try {
      await resendOtp(phoneNumber);
      
      // Reset timer
      setTimer(60);
      setCanResend(false);
      
      Alert.alert(
        'OTP Sent / OTP भेजा गया',
        'A new OTP has been sent to your phone / आपके फ़ोन पर एक नया OTP भेजा गया है'
      );
    } catch (err: any) {
      const errorMessage = err.message || 'OTP पुनः भेजना विफल / Failed to resend OTP';
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>📱</Text>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>OTP सत्यापित करें</Text>
          <Text style={styles.description}>
            Enter the 6-digit code sent to{'\n'}
            {phoneNumber}
          </Text>
          <Text style={styles.descriptionHindi}>
            {phoneNumber} पर भेजे गए 6 अंकों का कोड दर्ज करें
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#95a5a6"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              editable={!isLoading}
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={handleVerifyOtp}
            disabled={isLoading}
            activeOpacity={0.7}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>
                Verify / सत्यापित करें
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={isResending}>
                <Text style={styles.resendText}>
                  {isResending ? 'Sending... / भेजा जा रहा है...' : 'Resend OTP / OTP पुनः भेजें'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend OTP in {timer}s / {timer}s में OTP पुनः भेजें
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}>
            <Text style={styles.backButtonText}>
              ← Back to Signup / साइनअप पर वापस जाएं
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.helperText}>
            For demo: Check console logs for OTP{'\n'}
            डेमो के लिए: OTP के लिए कंसोल लॉग देखें
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 60,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  descriptionHindi: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
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
  otpInput: {
    height: 70,
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 32,
    color: '#2c3e50',
    backgroundColor: '#fff',
    textAlign: 'center',
    letterSpacing: 10,
    fontWeight: 'bold',
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
    fontSize: 14,
    lineHeight: 20,
  },
  verifyButton: {
    backgroundColor: '#27ae60',
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyButtonDisabled: {
    backgroundColor: '#95a5a6',
    shadowOpacity: 0.1,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default OTPVerificationScreen;
