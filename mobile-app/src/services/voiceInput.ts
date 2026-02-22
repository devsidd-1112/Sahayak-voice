/**
 * Voice Input Module
 * 
 * Handles voice recording and speech-to-text conversion using react-native-voice
 * Supports Hindi ('hi-IN') and English ('en-IN') locales
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';
import { PermissionsAndroid, Platform } from 'react-native';
import { Language, VoiceInputResult } from '../types';

export interface VoiceInputModule {
  startRecording(language: Language): Promise<void>;
  stopRecording(): Promise<string>;
  cancelRecording(): void;
  isRecording(): boolean;
  getSupportedLanguages(): string[];
}

class VoiceInputService implements VoiceInputModule {
  private recording: boolean = false;
  private transcribedText: string = '';
  private currentLanguage: Language = 'hi';
  
  // Language locale mapping
  private readonly localeMap: Record<Language, string> = {
    hi: 'hi-IN',
    en: 'en-IN',
  };

  constructor() {
    // Set up voice event listeners
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechError = this.onSpeechError;
  }

  /**
   * Request microphone permission on Android
   */
  private async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record voice input.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Error requesting microphone permission:', err);
        return false;
      }
    }
    // iOS permissions are handled via Info.plist
    return true;
  }

  /**
   * Event handler for speech start
   */
  private onSpeechStart = (event: SpeechStartEvent) => {
    console.log('Speech started:', event);
  };

  /**
   * Event handler for speech end
   */
  private onSpeechEnd = (event: SpeechEndEvent) => {
    console.log('Speech ended:', event);
  };

  /**
   * Event handler for speech results
   */
  private onSpeechResults = (event: SpeechResultsEvent) => {
    if (event.value && event.value.length > 0) {
      this.transcribedText = event.value[0];
      console.log('Speech results:', this.transcribedText);
    }
  };

  /**
   * Event handler for speech errors
   */
  private onSpeechError = (event: SpeechErrorEvent) => {
    console.error('Speech error:', event.error);
  };

  /**
   * Start recording audio and converting to text
   * Requirements: 2.1, 2.4
   */
  async startRecording(language: Language = 'hi'): Promise<void> {
    // Check microphone permission
    const hasPermission = await this.requestMicrophonePermission();
    if (!hasPermission) {
      throw new Error('Microphone permission denied');
    }

    // Reset transcribed text
    this.transcribedText = '';
    this.currentLanguage = language;

    try {
      // Start voice recognition with specified locale
      const locale = this.localeMap[language];
      await Voice.start(locale);
      this.recording = true;
      console.log(`Recording started with locale: ${locale}`);
    } catch (error) {
      console.error('Error starting recording:', error);
      this.recording = false;
      throw new Error('Failed to start recording');
    }
  }

  /**
   * Stop recording and return transcribed text
   * Requirements: 2.2, 2.3
   */
  async stopRecording(): Promise<string> {
    if (!this.recording) {
      throw new Error('No recording in progress');
    }

    try {
      await Voice.stop();
      this.recording = false;
      
      // Wait a brief moment for final results to be processed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = this.transcribedText;
      console.log('Recording stopped. Transcribed text:', result);
      
      return result;
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.recording = false;
      throw new Error('Failed to stop recording');
    }
  }

  /**
   * Cancel recording without returning text
   */
  cancelRecording(): void {
    if (this.recording) {
      Voice.cancel()
        .then(() => {
          this.recording = false;
          this.transcribedText = '';
          console.log('Recording cancelled');
        })
        .catch(error => {
          console.error('Error cancelling recording:', error);
          this.recording = false;
        });
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.recording;
  }

  /**
   * Get list of supported languages
   * Requirements: 2.4
   */
  getSupportedLanguages(): string[] {
    return ['hi-IN', 'en-IN'];
  }

  /**
   * Clean up voice recognition resources
   */
  async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      Voice.removeAllListeners();
    } catch (error) {
      console.error('Error destroying voice service:', error);
    }
  }
}

// Export singleton instance
export const voiceInputService = new VoiceInputService();
export default voiceInputService;
