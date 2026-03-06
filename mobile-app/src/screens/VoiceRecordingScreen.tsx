import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
  BackHandler,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {VoiceRecordingScreenNavigationProp, RootStackParamList} from '../navigation/types';
import {voiceInputService} from '../services/voiceInput';
import {entityExtractor} from '../services/entityExtractor';
import {Language} from '../types';

type VoiceRecordingScreenRouteProp = RouteProp<RootStackParamList, 'VoiceRecording'>;

/**
 * Voice Recording Screen Component
 * 
 * Screen for capturing speech input from ASHA workers.
 * Features:
 * - Receives language selection from Home screen
 * - Manual start/stop recording controls
 * - Animated microphone icon (pulsing during recording)
 * - Display transcribed text after recording stops
 * - Integrate VoiceInputModule for speech-to-text
 * - Hardware back button handling (Android)
 * 
 * Requirements: 2.1, 2.2, 2.3, 8.3
 */

const VoiceRecordingScreen: React.FC = () => {
  const navigation = useNavigation<VoiceRecordingScreenNavigationProp>();
  const route = useRoute<VoiceRecordingScreenRouteProp>();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(route.params?.language || 'en');
  const [isReady, setIsReady] = useState(false);
  
  // Animation values for pulsing microphone
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Start pulsing animation when recording begins
  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording]);

  // Initialize screen
  useEffect(() => {
    console.log('[VoiceRecordingScreen] Screen mounted with language:', selectedLanguage);
    setIsReady(true);
    
    // Cleanup on unmount
    return () => {
      console.log('[VoiceRecordingScreen] Screen unmounting, cleaning up');
      if (voiceInputService.isRecording()) {
        voiceInputService.cancelRecording();
      }
      voiceInputService.destroy();
    };
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [isRecording]);

  /**
   * Handle hardware back button press on Android
   * Shows confirmation dialog if recording is in progress
   */
  const handleBackPress = (): boolean => {
    if (isRecording) {
      handleCancelRecording();
      return true; // Prevent default back behavior
    }
    return false; // Allow default back behavior if not recording
  };

  /**
   * Start pulsing animation for microphone icon
   */
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  /**
   * Stop pulsing animation
   */
  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    opacityAnim.stopAnimation();
    pulseAnim.setValue(1);
    opacityAnim.setValue(1);
  };

  /**
   * Start voice recording
   * Requirements: 2.1
   */
  const handleStartRecording = async () => {
    console.log('[VoiceRecordingScreen] Start recording button pressed');
    
    try {
      setTranscribedText('');
      await voiceInputService.startRecording(selectedLanguage);
      setIsRecording(true);
      console.log('[VoiceRecordingScreen] Recording started successfully');
    } catch (error: any) {
      console.error('[VoiceRecordingScreen] Error starting recording:', error);
      Alert.alert(
        'Recording Error / रिकॉर्डिंग त्रुटि',
        error?.message || 'Failed to start recording. Please check microphone permissions.\nरिकॉर्डिंग शुरू करने में विफल। कृपया माइक्रोफ़ोन अनुमतियाँ जांचें।',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  /**
   * Stop voice recording and process transcribed text
   * Requirements: 2.2, 2.3
   */
  const handleStopRecording = async () => {
    console.log('[VoiceRecordingScreen] Stop recording button pressed');
    
    try {
      const text = await voiceInputService.stopRecording();
      setIsRecording(false);
      setTranscribedText(text);
      
      console.log('[VoiceRecordingScreen] Transcribed text:', text || '(empty)');

      // If we have transcribed text, extract entities and navigate to confirmation
      if (text && text.trim().length > 0) {
        // Extract entities from transcribed text
        const extractedData = entityExtractor.extractEntities(text, selectedLanguage);
        
        console.log('[VoiceRecordingScreen] Extracted data:', extractedData);
        
        // Navigate to confirmation screen with extracted data
        navigation.navigate('VoiceConfirmation', {
          extractedData: {
            patientName: extractedData.patientName,
            bloodPressure: extractedData.bloodPressure,
            childSymptom: extractedData.childSymptom,
            visitDate: extractedData.visitDate,
          },
        });
      } else {
        // No speech detected or recognized
        Alert.alert(
          'No Speech Detected / कोई आवाज़ नहीं मिली',
          `No speech was recognized. Please try again and speak clearly in ${selectedLanguage === 'hi' ? 'Hindi' : 'English'}.\n\nकोई आवाज़ नहीं पहचानी गई। कृपया पुनः प्रयास करें और स्पष्ट रूप से ${selectedLanguage === 'hi' ? 'हिंदी' : 'अंग्रेजी'} में बोलें।\n\nTips:\n• Speak clearly and not too fast\n• Reduce background noise\n• Hold phone closer to mouth`,
          [
            {
              text: 'Try Again / पुनः प्रयास करें',
              onPress: handleStartRecording,
            },
            {
              text: 'Cancel / रद्द करें',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('[VoiceRecordingScreen] Error stopping recording:', error);
      setIsRecording(false);
      Alert.alert(
        'Recording Error / रिकॉर्डिंग त्रुटि',
        'Failed to process recording. Please try again.\nरिकॉर्डिंग प्रोसेस करने में विफल। कृपया पुनः प्रयास करें।',
        [
          {
            text: 'Try Again / पुनः प्रयास करें',
            onPress: handleStartRecording,
          },
          {
            text: 'Cancel / रद्द करें',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  /**
   * Cancel recording and go back
   */
  const handleCancelRecording = () => {
    Alert.alert(
      'Cancel Recording / रिकॉर्डिंग रद्द करें',
      'Are you sure you want to cancel?\nक्या आप रद्द करना चाहते हैं?',
      [
        {
          text: 'No / नहीं',
          style: 'cancel',
        },
        {
          text: 'Yes / हाँ',
          style: 'destructive',
          onPress: () => {
            voiceInputService.cancelRecording();
            setIsRecording(false);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#27ae60" />
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#27ae60" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedLanguage === 'hi' ? 'विज़िट रिकॉर्ड करें' : 'Record Visit'}
        </Text>
        
        {/* Language Display */}
        <View style={styles.languageDisplay}>
          <Text style={styles.languageDisplayText}>
            {selectedLanguage === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Microphone Icon */}
        <Animated.View
          style={[
            styles.microphoneContainer,
            {
              transform: [{scale: pulseAnim}],
              opacity: opacityAnim,
            },
          ]}>
          <Text style={styles.microphoneIcon}>🎤</Text>
        </Animated.View>

        {/* Recording Status */}
        {isRecording && (
          <View style={styles.recordingStatusContainer}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              {selectedLanguage === 'hi' ? 'रिकॉर्डिंग...' : 'Recording...'}
            </Text>
          </View>
        )}

        {/* Instruction Text */}
        <Text style={styles.instructionText}>
          {isRecording
            ? selectedLanguage === 'hi'
              ? 'बोलें... हम सुन रहे हैं'
              : 'Speak now... We are listening'
            : selectedLanguage === 'hi'
            ? 'रिकॉर्डिंग शुरू करने के लिए नीचे बटन दबाएं'
            : 'Press the button below to start recording'}
        </Text>

        {/* Transcribed Text Display */}
        {transcribedText.length > 0 && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionLabel}>
              {selectedLanguage === 'hi' ? 'आपने कहा:' : 'You said:'}
            </Text>
            <Text style={styles.transcriptionText}>{transcribedText}</Text>
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <>
            {/* Start Recording Button */}
            <TouchableOpacity
              style={[styles.controlButton, styles.startButton]}
              onPress={handleStartRecording}
              activeOpacity={0.8}>
              <Text style={styles.controlButtonIcon}>🔴</Text>
              <Text style={styles.controlButtonText}>
                {selectedLanguage === 'hi' ? 'रिकॉर्डिंग शुरू करें' : 'Start Recording'}
              </Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
              style={[styles.controlButton, styles.backButton]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}>
              <Text style={styles.controlButtonIcon}>🔙</Text>
              <Text style={styles.controlButtonText}>
                {selectedLanguage === 'hi' ? 'वापस' : 'Back'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Stop Button */}
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStopRecording}
              activeOpacity={0.8}>
              <Text style={styles.controlButtonIcon}>⏹️</Text>
              <Text style={styles.controlButtonText}>
                {selectedLanguage === 'hi' ? 'रोकें' : 'Stop'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.controlButton, styles.cancelButton]}
              onPress={handleCancelRecording}
              activeOpacity={0.8}>
              <Text style={styles.controlButtonIcon}>❌</Text>
              <Text style={styles.controlButtonText}>
                {selectedLanguage === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#27ae60',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#229954',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  languageDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageDisplayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  microphoneContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  microphoneIcon: {
    fontSize: 100,
  },
  recordingStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e74c3c',
    marginRight: 10,
  },
  recordingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  transcriptionContainer: {
    marginTop: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: 200,
  },
  transcriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#229954',
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#e74c3c',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  backButton: {
    backgroundColor: '#95a5a6',
  },
  controlButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default VoiceRecordingScreen;
