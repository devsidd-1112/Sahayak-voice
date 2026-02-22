/**
 * TTS Module
 * 
 * Provides text-to-speech functionality for voice confirmation and prompts.
 * Supports Hindi and English languages.
 * 
 * Requirements: 4.1, 4.2, 4.3
 */

import Tts from 'react-native-tts';
import { VisitRecord, Language } from '../types';

/**
 * TTSModule interface defining text-to-speech operations
 */
export interface TTSModule {
  /**
   * Speak confirmation of extracted visit record data
   * @param record - The visit record to confirm
   * @param language - Language for TTS output ('hi' or 'en')
   */
  speakConfirmation(record: VisitRecord, language: Language): Promise<void>;

  /**
   * Speak prompt for missing required fields
   * @param missingFields - Array of field names that are missing
   * @param language - Language for TTS output ('hi' or 'en')
   */
  speakPrompt(missingFields: string[], language: Language): Promise<void>;

  /**
   * Stop any ongoing TTS playback
   */
  stop(): void;
}

/**
 * Confirmation text templates for different languages
 */
const CONFIRMATION_TEMPLATES = {
  hi: {
    full: (name: string, bp: string, symptom: string) =>
      `${name} ka BP ${bp} record kiya gaya. Bacche ko ${symptom} hai.`,
    nameOnly: (name: string) => `${name} ka naam record kiya gaya.`,
    bpOnly: (bp: string) => `BP ${bp} record kiya gaya.`,
    symptomOnly: (symptom: string) => `Bacche ko ${symptom} hai.`,
    nameBp: (name: string, bp: string) =>
      `${name} ka BP ${bp} record kiya gaya.`,
    nameSymptom: (name: string, symptom: string) =>
      `${name} ka naam record kiya gaya. Bacche ko ${symptom} hai.`,
    bpSymptom: (bp: string, symptom: string) =>
      `BP ${bp} record kiya gaya. Bacche ko ${symptom} hai.`,
  },
  en: {
    full: (name: string, bp: string, symptom: string) =>
      `Recorded ${name}'s BP as ${bp}. Child has ${symptom}.`,
    nameOnly: (name: string) => `Recorded ${name}'s name.`,
    bpOnly: (bp: string) => `Recorded BP as ${bp}.`,
    symptomOnly: (symptom: string) => `Child has ${symptom}.`,
    nameBp: (name: string, bp: string) =>
      `Recorded ${name}'s BP as ${bp}.`,
    nameSymptom: (name: string, symptom: string) =>
      `Recorded ${name}'s name. Child has ${symptom}.`,
    bpSymptom: (bp: string, symptom: string) =>
      `Recorded BP as ${bp}. Child has ${symptom}.`,
  },
};

/**
 * Missing field prompt templates for different languages
 */
const MISSING_FIELD_PROMPTS = {
  hi: {
    patientName: 'Kripya patient ka naam batayein.',
    bloodPressure: 'Kripya blood pressure batayein.',
    childSymptom: 'Kripya bacche ki bimari batayein.',
    multiple: 'Kuch jaankari missing hai. Kripya dobara record karein.',
  },
  en: {
    patientName: 'Please provide the patient name.',
    bloodPressure: 'Please provide the blood pressure.',
    childSymptom: 'Please provide the child symptom.',
    multiple: 'Some information is missing. Please record again.',
  },
};

/**
 * Implementation of TTSModule using react-native-tts
 */
export class TTSService implements TTSModule {
  private initialized: boolean = false;

  constructor() {
    this.initializeTts();
  }

  /**
   * Initialize TTS engine with default settings
   */
  private async initializeTts(): Promise<void> {
    try {
      // Set default language to Hindi
      await Tts.setDefaultLanguage('hi-IN');
      
      // Set default speech rate (1.0 is normal speed)
      await Tts.setDefaultRate(0.5);
      
      // Set default pitch (1.0 is normal pitch)
      await Tts.setDefaultPitch(1.0);
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize TTS:', error);
      this.initialized = false;
    }
  }

  /**
   * Generate confirmation text based on available fields in the record
   */
  private generateConfirmationText(
    record: VisitRecord,
    language: Language
  ): string {
    const templates = CONFIRMATION_TEMPLATES[language];
    const hasName = record.patientName !== null && record.patientName !== '';
    const hasBp = record.bloodPressure !== null && record.bloodPressure !== '';
    const hasSymptom = record.childSymptom !== null && record.childSymptom !== '';

    // All three fields present
    if (hasName && hasBp && hasSymptom) {
      return templates.full(
        record.patientName!,
        record.bloodPressure!,
        record.childSymptom!
      );
    }

    // Two fields present
    if (hasName && hasBp) {
      return templates.nameBp(record.patientName!, record.bloodPressure!);
    }
    if (hasName && hasSymptom) {
      return templates.nameSymptom(record.patientName!, record.childSymptom!);
    }
    if (hasBp && hasSymptom) {
      return templates.bpSymptom(record.bloodPressure!, record.childSymptom!);
    }

    // Single field present
    if (hasName) {
      return templates.nameOnly(record.patientName!);
    }
    if (hasBp) {
      return templates.bpOnly(record.bloodPressure!);
    }
    if (hasSymptom) {
      return templates.symptomOnly(record.childSymptom!);
    }

    // No fields present
    return language === 'hi'
      ? 'Koi jaankari record nahi hui.'
      : 'No information was recorded.';
  }

  /**
   * Speak confirmation of extracted visit record data
   */
  async speakConfirmation(
    record: VisitRecord,
    language: Language
  ): Promise<void> {
    if (!this.initialized) {
      await this.initializeTts();
    }

    try {
      // Set language for this utterance
      const ttsLanguage = language === 'hi' ? 'hi-IN' : 'en-IN';
      await Tts.setDefaultLanguage(ttsLanguage);

      // Generate confirmation text
      const confirmationText = this.generateConfirmationText(record, language);

      // Speak the confirmation
      await Tts.speak(confirmationText);
    } catch (error) {
      console.error('Failed to speak confirmation:', error);
      throw new Error('TTS confirmation failed');
    }
  }

  /**
   * Speak prompt for missing required fields
   */
  async speakPrompt(
    missingFields: string[],
    language: Language
  ): Promise<void> {
    if (!this.initialized) {
      await this.initializeTts();
    }

    try {
      // Set language for this utterance
      const ttsLanguage = language === 'hi' ? 'hi-IN' : 'en-IN';
      await Tts.setDefaultLanguage(ttsLanguage);

      const prompts = MISSING_FIELD_PROMPTS[language];

      // If multiple fields are missing, use generic prompt
      if (missingFields.length > 1) {
        await Tts.speak(prompts.multiple);
        return;
      }

      // Speak specific prompt for the missing field
      const field = missingFields[0];
      let promptText: string;

      switch (field) {
        case 'patientName':
          promptText = prompts.patientName;
          break;
        case 'bloodPressure':
          promptText = prompts.bloodPressure;
          break;
        case 'childSymptom':
          promptText = prompts.childSymptom;
          break;
        default:
          promptText = prompts.multiple;
      }

      await Tts.speak(promptText);
    } catch (error) {
      console.error('Failed to speak prompt:', error);
      throw new Error('TTS prompt failed');
    }
  }

  /**
   * Stop any ongoing TTS playback
   */
  stop(): void {
    try {
      Tts.stop();
    } catch (error) {
      console.error('Failed to stop TTS:', error);
    }
  }
}

// Export singleton instance
export const ttsService = new TTSService();
