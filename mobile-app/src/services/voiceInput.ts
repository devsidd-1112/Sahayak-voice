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
  private currentLanguage: Language = 'en';
  private isInitialized: boolean = false;
  
  // Language locale mapping
  private readonly localeMap: Record<Language, string> = {
    hi: 'hi-IN',
    en: 'en-IN',
  };

  constructor() {
    console.log('[VoiceInput] Service initialized');
  }

  /**
   * Initialize Voice module and set up event listeners
   * This should be called once before starting recording
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[VoiceInput] Already initialized, cleaning up first');
      await this.cleanup();
    }

    console.log('[VoiceInput] Setting up event listeners');
    
    // Remove any existing listeners first
    Voice.removeAllListeners();
    
    // Set up voice event listeners
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    
    this.isInitialized = true;
    console.log('[VoiceInput] Initialization complete');
  }

  /**
   * Clean up Voice module resources
   */
  private async cleanup(): Promise<void> {
    try {
      console.log('[VoiceInput] Cleaning up Voice module');
      await Voice.destroy();
      Voice.removeAllListeners();
      this.isInitialized = false;
      this.recording = false;
      console.log('[VoiceInput] Cleanup complete');
    } catch (error) {
      console.log('[VoiceInput] Cleanup error (non-fatal):', error);
    }
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
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('[VoiceInput] Microphone permission:', isGranted ? 'granted' : 'denied');
        return isGranted;
      } catch (err) {
        console.error('[VoiceInput] Error requesting microphone permission:', err);
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
    console.log('[VoiceInput] ✅ Speech started:', event);
  };

  /**
   * Event handler for speech end
   */
  private onSpeechEnd = (event: SpeechEndEvent) => {
    console.log('[VoiceInput] ⏹️ Speech ended:', event);
  };

  /**
   * Event handler for partial speech results (real-time)
   */
  private onSpeechPartialResults = (event: SpeechResultsEvent) => {
    if (event.value && event.value.length > 0) {
      console.log('[VoiceInput] 📝 Partial result:', event.value[0]);
    }
  };

  /**
   * Event handler for final speech results
   */
  private onSpeechResults = (event: SpeechResultsEvent) => {
    if (event.value && event.value.length > 0) {
      this.transcribedText = event.value[0];
      console.log('[VoiceInput] ✅ Final result:', this.transcribedText);
    } else {
      console.log('[VoiceInput] ⚠️ No results in event');
    }
  };

  /**
   * Event handler for speech errors
   */
  private onSpeechError = (event: SpeechErrorEvent) => {
    const errorCode = event.error?.code;
    const errorMessage = event.error?.message;
    
    console.log('[VoiceInput] ❌ Speech error:', {
      code: errorCode,
      message: errorMessage,
    });
    
    // Convert errorCode to string for comparison
    const codeStr = String(errorCode);
    
    // Error code 7 means "No match" - speech was heard but not recognized
    // This is not a fatal error, just means user needs to speak again
    if (codeStr === '7') {
      console.log('[VoiceInput] No speech match detected - user should try speaking again');
      return;
    }
    
    // Error code 5 means "Client side error" - usually a state issue
    if (codeStr === '5') {
      console.log('[VoiceInput] Client error - may need to restart recognition');
      return;
    }
    
    // For other errors, log them
    console.error('[VoiceInput] Unhandled speech error:', event.error);
  };

  /**
   * Start recording audio and converting to text
   * Requirements: 2.1, 2.4
   */
  async startRecording(language: Language = 'en'): Promise<void> {
    console.log('[VoiceInput] ========================================');
    console.log('[VoiceInput] START RECORDING REQUEST');
    console.log('[VoiceInput] Language:', language);
    console.log('[VoiceInput] ========================================');

    // Check microphone permission
    const hasPermission = await this.requestMicrophonePermission();
    if (!hasPermission) {
      throw new Error('Microphone permission denied');
    }

    // Reset transcribed text
    this.transcribedText = '';
    this.currentLanguage = language;

    try {
      // Initialize Voice module (cleans up any previous state)
      await this.initialize();
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get locale for the selected language
      const locale = this.localeMap[language];
      console.log('[VoiceInput] Starting recognition with locale:', locale);
      
      // Start voice recognition
      await Voice.start(locale);
      this.recording = true;
      console.log('[VoiceInput] ✅ Recording started successfully');
      
    } catch (error: any) {
      console.error('[VoiceInput] ❌ Error starting recording:', error);
      this.recording = false;
      await this.cleanup();
      
      // Provide specific error message
      if (error?.message?.includes('not available')) {
        throw new Error('Speech recognition service not available. Please install "Speech Services by Google" from Play Store.');
      } else if (error?.message?.includes('permission')) {
        throw new Error('Microphone permission denied. Please enable it in Settings.');
      } else {
        throw new Error('Failed to start recording: ' + (error?.message || 'Unknown error'));
      }
    }
  }

  /**
   * Stop recording and return transcribed text
   * Requirements: 2.2, 2.3
   */
  async stopRecording(): Promise<string> {
    console.log('[VoiceInput] ========================================');
    console.log('[VoiceInput] STOP RECORDING REQUEST');
    console.log('[VoiceInput] ========================================');

    if (!this.recording) {
      console.log('[VoiceInput] ⚠️ No recording in progress');
      return '';
    }

    try {
      await Voice.stop();
      this.recording = false;
      
      // Wait for final results to be processed
      console.log('[VoiceInput] Waiting for final results...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = this.transcribedText;
      console.log('[VoiceInput] Final transcribed text:', result || '(empty)');
      
      // Clean up after stopping
      await this.cleanup();
      
      return result || '';
    } catch (error) {
      console.error('[VoiceInput] Error stopping recording:', error);
      this.recording = false;
      await this.cleanup();
      return '';
    }
  }

  /**
   * Cancel recording without returning text
   */
  cancelRecording(): void {
    console.log('[VoiceInput] CANCEL RECORDING REQUEST');
    
    if (this.recording) {
      Voice.cancel()
        .then(() => {
          this.recording = false;
          this.transcribedText = '';
          console.log('[VoiceInput] Recording cancelled');
          this.cleanup();
        })
        .catch(error => {
          console.error('[VoiceInput] Error cancelling recording:', error);
          this.recording = false;
          this.cleanup();
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
   * Check if voice recognition is available on device
   */
  async isAvailable(): Promise<boolean> {
    try {
      const isAvailable = await Voice.isAvailable();
      console.log('[VoiceInput] Voice.isAvailable() returned:', isAvailable);
      
      // On some devices, isAvailable returns true/false instead of 1/0
      if (typeof isAvailable === 'boolean') {
        return isAvailable;
      }
      // On other devices, it returns 1 for available, 0 for not available
      return isAvailable === 1;
    } catch (error) {
      console.error('[VoiceInput] Error checking voice availability:', error);
      // Assume available and let start() handle the error
      return true;
    }
  }

  /**
   * Clean up voice recognition resources
   * Call this when the component unmounts
   */
  async destroy(): Promise<void> {
    console.log('[VoiceInput] DESTROY SERVICE');
    await this.cleanup();
  }
}

// Export singleton instance
export const voiceInputService = new VoiceInputService();
export default voiceInputService;
