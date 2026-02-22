/**
 * Unit Tests for TTS Module
 * 
 * Tests the text-to-speech functionality for voice confirmation and prompts.
 */

import { TTSService } from '../tts';
import { VisitRecord } from '../../types';
import Tts from 'react-native-tts';

// Mock react-native-tts
jest.mock('react-native-tts', () => ({
  setDefaultLanguage: jest.fn().mockResolvedValue(undefined),
  setDefaultRate: jest.fn().mockResolvedValue(undefined),
  setDefaultPitch: jest.fn().mockResolvedValue(undefined),
  speak: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn(),
}));

describe('TTSService', () => {
  let ttsService: TTSService;

  beforeEach(() => {
    jest.clearAllMocks();
    ttsService = new TTSService();
  });

  describe('speakConfirmation', () => {
    it('should speak confirmation with all fields in Hindi', async () => {
      const record: VisitRecord = {
        patientName: 'Sunita Devi',
        bloodPressure: '140/90',
        childSymptom: 'bukhar',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'hi');

      expect(Tts.setDefaultLanguage).toHaveBeenCalledWith('hi-IN');
      expect(Tts.speak).toHaveBeenCalledWith(
        'Sunita Devi ka BP 140/90 record kiya gaya. Bacche ko bukhar hai.'
      );
    });

    it('should speak confirmation with all fields in English', async () => {
      const record: VisitRecord = {
        patientName: 'Sunita Devi',
        bloodPressure: '140/90',
        childSymptom: 'fever',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'en');

      expect(Tts.setDefaultLanguage).toHaveBeenCalledWith('en-IN');
      expect(Tts.speak).toHaveBeenCalledWith(
        "Recorded Sunita Devi's BP as 140/90. Child has fever."
      );
    });

    it('should speak confirmation with only patient name', async () => {
      const record: VisitRecord = {
        patientName: 'Sunita Devi',
        bloodPressure: null,
        childSymptom: null,
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'hi');

      expect(Tts.speak).toHaveBeenCalledWith('Sunita Devi ka naam record kiya gaya.');
    });

    it('should speak confirmation with only blood pressure', async () => {
      const record: VisitRecord = {
        patientName: null,
        bloodPressure: '120/80',
        childSymptom: null,
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'en');

      expect(Tts.speak).toHaveBeenCalledWith('Recorded BP as 120/80.');
    });

    it('should speak confirmation with only child symptom', async () => {
      const record: VisitRecord = {
        patientName: null,
        bloodPressure: null,
        childSymptom: 'khansi',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'hi');

      expect(Tts.speak).toHaveBeenCalledWith('Bacche ko khansi hai.');
    });

    it('should speak confirmation with name and BP only', async () => {
      const record: VisitRecord = {
        patientName: 'Raj Kumar',
        bloodPressure: '130/85',
        childSymptom: null,
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'en');

      expect(Tts.speak).toHaveBeenCalledWith("Recorded Raj Kumar's BP as 130/85.");
    });

    it('should speak confirmation with name and symptom only', async () => {
      const record: VisitRecord = {
        patientName: 'Priya Sharma',
        bloodPressure: null,
        childSymptom: 'cold',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'en');

      expect(Tts.speak).toHaveBeenCalledWith(
        "Recorded Priya Sharma's name. Child has cold."
      );
    });

    it('should speak confirmation with BP and symptom only', async () => {
      const record: VisitRecord = {
        patientName: null,
        bloodPressure: '110/70',
        childSymptom: 'dast',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'hi');

      expect(Tts.speak).toHaveBeenCalledWith(
        'BP 110/70 record kiya gaya. Bacche ko dast hai.'
      );
    });

    it('should handle empty record gracefully in Hindi', async () => {
      const record: VisitRecord = {
        patientName: null,
        bloodPressure: null,
        childSymptom: null,
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'hi');

      expect(Tts.speak).toHaveBeenCalledWith('Koi jaankari record nahi hui.');
    });

    it('should handle empty record gracefully in English', async () => {
      const record: VisitRecord = {
        patientName: null,
        bloodPressure: null,
        childSymptom: null,
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'en');

      expect(Tts.speak).toHaveBeenCalledWith('No information was recorded.');
    });

    it('should handle empty strings as missing fields', async () => {
      const record: VisitRecord = {
        patientName: '',
        bloodPressure: '',
        childSymptom: '',
        visitDate: '2024-01-20',
        createdAt: '2024-01-20T14:30:00Z',
        syncStatus: 'pending',
        userId: 'user123',
      };

      await ttsService.speakConfirmation(record, 'hi');

      expect(Tts.speak).toHaveBeenCalledWith('Koi jaankari record nahi hui.');
    });
  });

  describe('speakPrompt', () => {
    it('should speak prompt for missing patient name in Hindi', async () => {
      await ttsService.speakPrompt(['patientName'], 'hi');

      expect(Tts.setDefaultLanguage).toHaveBeenCalledWith('hi-IN');
      expect(Tts.speak).toHaveBeenCalledWith('Kripya patient ka naam batayein.');
    });

    it('should speak prompt for missing blood pressure in English', async () => {
      await ttsService.speakPrompt(['bloodPressure'], 'en');

      expect(Tts.setDefaultLanguage).toHaveBeenCalledWith('en-IN');
      expect(Tts.speak).toHaveBeenCalledWith('Please provide the blood pressure.');
    });

    it('should speak prompt for missing child symptom in Hindi', async () => {
      await ttsService.speakPrompt(['childSymptom'], 'hi');

      expect(Tts.speak).toHaveBeenCalledWith('Kripya bacche ki bimari batayein.');
    });

    it('should speak generic prompt for multiple missing fields in Hindi', async () => {
      await ttsService.speakPrompt(['patientName', 'bloodPressure'], 'hi');

      expect(Tts.speak).toHaveBeenCalledWith(
        'Kuch jaankari missing hai. Kripya dobara record karein.'
      );
    });

    it('should speak generic prompt for multiple missing fields in English', async () => {
      await ttsService.speakPrompt(['patientName', 'childSymptom'], 'en');

      expect(Tts.speak).toHaveBeenCalledWith(
        'Some information is missing. Please record again.'
      );
    });

    it('should handle unknown field name gracefully', async () => {
      await ttsService.speakPrompt(['unknownField'], 'hi');

      expect(Tts.speak).toHaveBeenCalledWith(
        'Kuch jaankari missing hai. Kripya dobara record karein.'
      );
    });
  });

  describe('stop', () => {
    it('should stop TTS playback', () => {
      ttsService.stop();

      expect(Tts.stop).toHaveBeenCalled();
    });

    it('should handle stop errors gracefully', () => {
      (Tts.stop as jest.Mock).mockImplementation(() => {
        throw new Error('Stop failed');
      });

      // Should not throw
      expect(() => ttsService.stop()).not.toThrow();
    });
  });

  describe('initialization', () => {
    it('should initialize TTS with default settings', async () => {
      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(Tts.setDefaultLanguage).toHaveBeenCalledWith('hi-IN');
      expect(Tts.setDefaultRate).toHaveBeenCalledWith(0.5);
      expect(Tts.setDefaultPitch).toHaveBeenCalledWith(1.0);
    });
  });
});
