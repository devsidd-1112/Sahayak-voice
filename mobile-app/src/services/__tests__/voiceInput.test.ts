/**
 * Unit Tests for Voice Input Module
 * 
 * Tests the voice recording and speech-to-text functionality.
 */

import { voiceInputService } from '../voiceInput';
import Voice from '@react-native-voice/voice';
import { PermissionsAndroid, Platform } from 'react-native';


// Mock @react-native-voice/voice
jest.mock('@react-native-voice/voice', () => ({
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  cancel: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  removeAllListeners: jest.fn(),
  onSpeechStart: null,
  onSpeechEnd: null,
  onSpeechResults: null,
  onSpeechError: null,
}));

// Mock PermissionsAndroid
jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => ({
  PERMISSIONS: {
    RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    NEVER_ASK_AGAIN: 'never_ask_again',
  },
  request: jest.fn().mockResolvedValue('granted'),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
  select: jest.fn((obj) => obj.android),
}));

describe('VoiceInputService', () => {
  let voiceInputService: VoiceInputService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a new instance for each test
    voiceInputService = new (require('../voiceInput').default.constructor)();
  });

  describe('startRecording', () => {
    it('should request microphone permission on Android', async () => {
      await voiceInputService.startRecording('hi');

      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        expect.any(Object)
      );
    });

    it('should start recording with Hindi locale', async () => {
      await voiceInputService.startRecording('hi');

      expect(Voice.start).toHaveBeenCalledWith('hi-IN');
      expect(voiceInputService.isRecording()).toBe(true);
    });

    it('should start recording with English locale', async () => {
      await voiceInputService.startRecording('en');

      expect(Voice.start).toHaveBeenCalledWith('en-IN');
      expect(voiceInputService.isRecording()).toBe(true);
    });

    it('should throw error if microphone permission is denied', async () => {
      (PermissionsAndroid.request as jest.Mock).mockResolvedValueOnce('denied');

      await expect(voiceInputService.startRecording('hi')).rejects.toThrow(
        'Microphone permission denied'
      );
      expect(voiceInputService.isRecording()).toBe(false);
    });

    it('should throw error if Voice.start fails', async () => {
      (Voice.start as jest.Mock).mockRejectedValueOnce(new Error('Start failed'));

      await expect(voiceInputService.startRecording('hi')).rejects.toThrow(
        'Failed to start recording'
      );
      expect(voiceInputService.isRecording()).toBe(false);
    });

    it('should default to Hindi if no language specified', async () => {
      await voiceInputService.startRecording();

      expect(Voice.start).toHaveBeenCalledWith('hi-IN');
    });
  });

  describe('stopRecording', () => {
    it('should stop recording and return transcribed text', async () => {
      // Start recording first
      await voiceInputService.startRecording('hi');

      // Simulate speech results
      if (Voice.onSpeechResults) {
        Voice.onSpeechResults({ value: ['Test transcription'] });
      }

      const result = await voiceInputService.stopRecording();

      expect(Voice.stop).toHaveBeenCalled();
      expect(result).toBe('Test transcription');
      expect(voiceInputService.isRecording()).toBe(false);
    });

    it('should throw error if not recording', async () => {
      await expect(voiceInputService.stopRecording()).rejects.toThrow(
        'No recording in progress'
      );
    });

    it('should throw error if Voice.stop fails', async () => {
      await voiceInputService.startRecording('hi');
      (Voice.stop as jest.Mock).mockRejectedValueOnce(new Error('Stop failed'));

      await expect(voiceInputService.stopRecording()).rejects.toThrow(
        'Failed to stop recording'
      );
      expect(voiceInputService.isRecording()).toBe(false);
    });

    it('should return empty string if no speech detected', async () => {
      await voiceInputService.startRecording('hi');

      const result = await voiceInputService.stopRecording();

      expect(result).toBe('');
    });
  });

  describe('cancelRecording', () => {
    it('should cancel recording if in progress', async () => {
      await voiceInputService.startRecording('hi');

      voiceInputService.cancelRecording();

      // Wait for async cancel to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(Voice.cancel).toHaveBeenCalled();
    });

    it('should do nothing if not recording', () => {
      voiceInputService.cancelRecording();

      expect(Voice.cancel).not.toHaveBeenCalled();
    });

    it('should handle cancel errors gracefully', async () => {
      await voiceInputService.startRecording('hi');
      (Voice.cancel as jest.Mock).mockRejectedValueOnce(new Error('Cancel failed'));

      // Should not throw
      expect(() => voiceInputService.cancelRecording()).not.toThrow();
    });
  });

  describe('isRecording', () => {
    it('should return false initially', () => {
      expect(voiceInputService.isRecording()).toBe(false);
    });

    it('should return true when recording', async () => {
      await voiceInputService.startRecording('hi');

      expect(voiceInputService.isRecording()).toBe(true);
    });

    it('should return false after stopping', async () => {
      await voiceInputService.startRecording('hi');
      await voiceInputService.stopRecording();

      expect(voiceInputService.isRecording()).toBe(false);
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return Hindi and English locales', () => {
      const languages = voiceInputService.getSupportedLanguages();

      expect(languages).toEqual(['hi-IN', 'en-IN']);
    });
  });

  describe('destroy', () => {
    it('should clean up voice recognition resources', async () => {
      await voiceInputService.destroy();

      expect(Voice.destroy).toHaveBeenCalled();
      expect(Voice.removeAllListeners).toHaveBeenCalled();
    });

    it('should handle destroy errors gracefully', async () => {
      (Voice.destroy as jest.Mock).mockRejectedValueOnce(new Error('Destroy failed'));

      // Should not throw
      await expect(voiceInputService.destroy()).resolves.not.toThrow();
    });
  });

  describe('event handlers', () => {
    it('should handle speech start event', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await voiceInputService.startRecording('hi');

      if (Voice.onSpeechStart) {
        Voice.onSpeechStart({ error: false });
      }

      expect(consoleSpy).toHaveBeenCalledWith('Speech started:', expect.any(Object));
      consoleSpy.mockRestore();
    });

    it('should handle speech end event', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await voiceInputService.startRecording('hi');

      if (Voice.onSpeechEnd) {
        Voice.onSpeechEnd({ error: false });
      }

      expect(consoleSpy).toHaveBeenCalledWith('Speech ended:', expect.any(Object));
      consoleSpy.mockRestore();
    });

    it('should handle speech error event', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await voiceInputService.startRecording('hi');

      if (Voice.onSpeechError) {
        Voice.onSpeechError({ error: { message: 'Test error', code: '1' } });
      }

      expect(consoleSpy).toHaveBeenCalledWith('Speech error:', expect.any(Object));
      consoleSpy.mockRestore();
    });
  });
});
