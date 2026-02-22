import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  VoiceConfirmationScreenNavigationProp,
  VoiceConfirmationScreenRouteProp,
} from '../navigation/types';
import {ttsService} from '../services/tts';
import {databaseService} from '../services/database';
import {VisitRecord, Language} from '../types';

/**
 * Voice Confirmation Screen Component
 * 
 * Screen for reviewing and confirming extracted visit data.
 * Features:
 * - Display extracted patient name, blood pressure, child symptom, and visit date
 * - Play confirmation button (triggers TTS)
 * - Confirm button (saves record to local database)
 * - Re-record button (goes back to recording screen)
 * - Visual feedback during TTS playback
 * - Handle missing fields with TTS prompts
 * - Hardware back button handling (Android)
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.3, 8.4
 */

const VoiceConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<VoiceConfirmationScreenNavigationProp>();
  const route = useRoute<VoiceConfirmationScreenRouteProp>();
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('hi');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // Extract data from navigation params
  const {extractedData} = route.params;

  // Load user ID on mount
  useEffect(() => {
    loadUserId();
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [isPlayingTTS, isSaving]);

  /**
   * Handle hardware back button press on Android
   * Prevents going back during TTS playback or saving
   */
  const handleBackPress = (): boolean => {
    if (isPlayingTTS || isSaving) {
      return true; // Prevent back during operations
    }
    handleReRecord();
    return true; // Prevent default back behavior
  };

  /**
   * Load user ID from AsyncStorage
   */
  const loadUserId = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserId(user.id || '');
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  /**
   * Create a VisitRecord from extracted data
   */
  const createVisitRecord = (): VisitRecord => {
    return {
      patientName: extractedData.patientName,
      bloodPressure: extractedData.bloodPressure,
      childSymptom: extractedData.childSymptom,
      visitDate: extractedData.visitDate,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      userId: userId,
    };
  };

  /**
   * Get list of missing required fields
   */
  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    
    if (!extractedData.patientName) {
      missing.push('patientName');
    }
    if (!extractedData.bloodPressure) {
      missing.push('bloodPressure');
    }
    if (!extractedData.childSymptom) {
      missing.push('childSymptom');
    }
    
    return missing;
  };

  /**
   * Handle play confirmation button
   * Triggers TTS to speak the extracted data or prompt for missing fields
   * Requirements: 4.1, 4.2, 4.3
   */
  const handlePlayConfirmation = async () => {
    try {
      setIsPlayingTTS(true);
      
      const missingFields = getMissingFields();
      
      if (missingFields.length > 0) {
        // Speak prompt for missing fields
        await ttsService.speakPrompt(missingFields, selectedLanguage);
      } else {
        // Speak confirmation of all extracted data
        const record = createVisitRecord();
        await ttsService.speakConfirmation(record, selectedLanguage);
      }
      
      setIsPlayingTTS(false);
    } catch (error) {
      console.error('Error playing TTS confirmation:', error);
      setIsPlayingTTS(false);
      
      Alert.alert(
        'TTS Error / TTS त्रुटि',
        'Failed to play voice confirmation.\nवॉइस पुष्टि चलाने में विफल।'
      );
    }
  };

  /**
   * Handle confirm button
   * Saves the visit record to local database and navigates back to home
   * Requirements: 4.4, 5.1, 5.3
   */
  const handleConfirm = async () => {
    try {
      setIsSaving(true);
      
      // Create visit record with syncStatus 'pending'
      const record = createVisitRecord();
      
      // Save to local database
      const insertId = await databaseService.saveVisit(record);
      
      console.log('Visit record saved with ID:', insertId);
      
      setIsSaving(false);
      
      // Show success message
      Alert.alert(
        'Success / सफलता',
        'Visit record saved successfully!\nविज़िट रिकॉर्ड सफलतापूर्वक सहेजा गया!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to Home Screen
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving visit record:', error);
      setIsSaving(false);
      
      Alert.alert(
        'Save Error / सहेजने में त्रुटि',
        'Failed to save visit record. Please try again.\nविज़िट रिकॉर्ड सहेजने में विफल। कृपया पुनः प्रयास करें।'
      );
    }
  };

  /**
   * Handle re-record button
   * Goes back to voice recording screen
   * Requirements: 4.5
   */
  const handleReRecord = () => {
    Alert.alert(
      'Re-record / फिर से रिकॉर्ड करें',
      'Do you want to record again?\nक्या आप फिर से रिकॉर्ड करना चाहते हैं?',
      [
        {
          text: 'Cancel / रद्द करें',
          style: 'cancel',
        },
        {
          text: 'Yes / हाँ',
          onPress: () => {
            // Stop any ongoing TTS
            ttsService.stop();
            // Navigate back to recording screen
            navigation.goBack();
          },
        },
      ]
    );
  };

  /**
   * Toggle language between Hindi and English
   */
  const handleToggleLanguage = () => {
    const newLanguage: Language = selectedLanguage === 'hi' ? 'en' : 'hi';
    setSelectedLanguage(newLanguage);
  };

  /**
   * Format date for display
   */
  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-IN', options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedLanguage === 'hi' ? 'पुष्टि करें' : 'Confirm Visit'}
        </Text>
        
        {/* Language Toggle */}
        <TouchableOpacity
          style={styles.languageButton}
          onPress={handleToggleLanguage}
          activeOpacity={0.7}>
          <Text style={styles.languageButtonText}>
            {selectedLanguage === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>
          {selectedLanguage === 'hi' ? 'निकाली गई जानकारी' : 'Extracted Information'}
        </Text>

        {/* Extracted Data Display */}
        <View style={styles.dataCard}>
          {/* Patient Name */}
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>
              👤 {selectedLanguage === 'hi' ? 'रोगी का नाम' : 'Patient Name'}:
            </Text>
            <Text style={[
              styles.dataValue,
              !extractedData.patientName && styles.dataValueMissing
            ]}>
              {extractedData.patientName || (selectedLanguage === 'hi' ? 'नहीं मिला' : 'Not found')}
            </Text>
          </View>

          {/* Blood Pressure */}
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>
              💉 {selectedLanguage === 'hi' ? 'रक्तचाप (BP)' : 'Blood Pressure'}:
            </Text>
            <Text style={[
              styles.dataValue,
              !extractedData.bloodPressure && styles.dataValueMissing
            ]}>
              {extractedData.bloodPressure || (selectedLanguage === 'hi' ? 'नहीं मिला' : 'Not found')}
            </Text>
          </View>

          {/* Child Symptom */}
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>
              🤒 {selectedLanguage === 'hi' ? 'बच्चे का लक्षण' : 'Child Symptom'}:
            </Text>
            <Text style={[
              styles.dataValue,
              !extractedData.childSymptom && styles.dataValueMissing
            ]}>
              {extractedData.childSymptom || (selectedLanguage === 'hi' ? 'नहीं मिला' : 'Not found')}
            </Text>
          </View>

          {/* Visit Date */}
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>
              📅 {selectedLanguage === 'hi' ? 'विज़िट की तारीख' : 'Visit Date'}:
            </Text>
            <Text style={styles.dataValue}>
              {formatDateForDisplay(extractedData.visitDate)}
            </Text>
          </View>
        </View>

        {/* Missing Fields Warning */}
        {getMissingFields().length > 0 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              {selectedLanguage === 'hi'
                ? 'कुछ जानकारी नहीं मिली। आप फिर से रिकॉर्ड कर सकते हैं या जारी रख सकते हैं।'
                : 'Some information is missing. You can re-record or continue.'}
            </Text>
          </View>
        )}

        {/* Play Confirmation Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.playButton]}
          onPress={handlePlayConfirmation}
          disabled={isPlayingTTS || isSaving}
          activeOpacity={0.8}>
          {isPlayingTTS ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.actionButtonIcon}>🔊</Text>
          )}
          <Text style={styles.actionButtonText}>
            {isPlayingTTS
              ? (selectedLanguage === 'hi' ? 'बोल रहा है...' : 'Speaking...')
              : (selectedLanguage === 'hi' ? 'पुष्टि सुनें' : 'Play Confirmation')}
          </Text>
        </TouchableOpacity>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.confirmButton]}
          onPress={handleConfirm}
          disabled={isPlayingTTS || isSaving}
          activeOpacity={0.8}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.actionButtonIcon}>✅</Text>
          )}
          <Text style={styles.actionButtonText}>
            {isSaving
              ? (selectedLanguage === 'hi' ? 'सहेज रहा है...' : 'Saving...')
              : (selectedLanguage === 'hi' ? 'पुष्टि करें और सहेजें' : 'Confirm & Save')}
          </Text>
        </TouchableOpacity>

        {/* Re-record Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.reRecordButton]}
          onPress={handleReRecord}
          disabled={isPlayingTTS || isSaving}
          activeOpacity={0.8}>
          <Text style={styles.actionButtonIcon}>🔄</Text>
          <Text style={styles.actionButtonText}>
            {selectedLanguage === 'hi' ? 'फिर से रिकॉर्ड करें' : 'Re-record'}
          </Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#3498db',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  dataCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataRow: {
    marginBottom: 20,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  dataValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  dataValueMissing: {
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 16,
    color: '#856404',
    lineHeight: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playButton: {
    backgroundColor: '#9b59b6',
  },
  confirmButton: {
    backgroundColor: '#27ae60',
  },
  reRecordButton: {
    backgroundColor: '#e67e22',
  },
  actionButtonIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VoiceConfirmationScreen;
