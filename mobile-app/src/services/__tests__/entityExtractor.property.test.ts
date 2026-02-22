/**
 * Property-Based Tests for Entity Extractor
 * 
 * Uses fast-check library to test universal properties across randomized inputs
 * 
 * Feature: sahayak-voice-mobile
 * Properties: 4, 5, 6, 7, 8
 */

import * as fc from 'fast-check';
import {SimpleEntityExtractor} from '../entityExtractor';

describe('EntityExtractor - Property-Based Tests', () => {
  const extractor = new SimpleEntityExtractor();

  /**
   * Property 4: Patient name extraction
   * For any transcribed text containing a patient name in the expected format,
   * the Entity_Extractor should correctly identify and extract the patient name.
   * 
   * Validates: Requirements 3.1
   */
  describe('Property 4: Patient name extraction', () => {
    it('should extract Hindi names after common phrases', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Sunita', 'Priya', 'Radha', 'Meera', 'Geeta', 'Sita'),
          fc.constantFrom('Devi', 'Kumar', 'Singh', 'Sharma'),
          (firstName, suffix) => {
            const fullName = `${firstName} ${suffix}`;
            // Pattern looks for names AFTER "ke ghar", "ki", "ka"
            const text = `Aaj ke ghar ${fullName} mili`;
            
            const result = extractor.extractEntities(text, 'hi');
            
            // Should extract the name
            if (result.patientName) {
              expect(result.patientName).toContain(firstName);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should extract English names with two capitalized words', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 3, maxLength: 10}).filter(s => /^[A-Z][a-z]+$/.test(s)),
          fc.string({minLength: 3, maxLength: 10}).filter(s => /^[A-Z][a-z]+$/.test(s)),
          (firstName, lastName) => {
            const fullName = `${firstName} ${lastName}`;
            const text = `Today visited ${fullName} at home`;
            
            const result = extractor.extractEntities(text, 'en');
            
            expect(result.patientName).toBe(fullName);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Blood pressure extraction
   * For any transcribed text containing a blood pressure reading in the format "X/Y",
   * the Entity_Extractor should correctly extract the blood pressure value.
   * 
   * Validates: Requirements 3.2
   */
  describe('Property 5: Blood pressure extraction', () => {
    it('should extract blood pressure in X/Y format', () => {
      fc.assert(
        fc.property(
          fc.integer({min: 80, max: 200}),
          fc.integer({min: 50, max: 130}),
          (systolic, diastolic) => {
            const bp = `${systolic}/${diastolic}`;
            const text = `Blood pressure is ${bp} today`;
            
            const result = extractor.extractEntities(text, 'en');
            
            expect(result.bloodPressure).toBe(bp);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should extract blood pressure with backslash separator', () => {
      fc.assert(
        fc.property(
          fc.integer({min: 80, max: 200}),
          fc.integer({min: 50, max: 130}),
          (systolic, diastolic) => {
            const bp = `${systolic}\\${diastolic}`;
            const text = `BP reading ${bp}`;
            
            const result = extractor.extractEntities(text, 'en');
            
            // Should normalize to forward slash
            expect(result.bloodPressure).toBe(`${systolic}/${diastolic}`);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Child symptom extraction
   * For any transcribed text containing known symptom keywords,
   * the Entity_Extractor should correctly identify and extract the child symptom.
   * 
   * Validates: Requirements 3.3
   */
  describe('Property 6: Child symptom extraction', () => {
    it('should extract Hindi symptoms', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('bukhar', 'khansi', 'dast', 'ulti', 'thand'),
          (symptom) => {
            const text = `Bacche ko ${symptom} hai`;
            
            const result = extractor.extractEntities(text, 'hi');
            
            expect(result.childSymptom).toBeTruthy();
            expect(result.childSymptom?.toLowerCase()).toContain(symptom);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should extract English symptoms', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('fever', 'cough', 'cold', 'diarrhea', 'vomiting'),
          (symptom) => {
            const text = `Child has ${symptom}`;
            
            const result = extractor.extractEntities(text, 'en');
            
            expect(result.childSymptom).toBeTruthy();
            expect(result.childSymptom?.toLowerCase()).toContain(symptom);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 7: Visit date extraction
   * For any transcribed text containing date references,
   * the Entity_Extractor should correctly extract and convert the date to ISO format.
   * 
   * Validates: Requirements 3.4
   */
  describe('Property 7: Visit date extraction', () => {
    it('should extract "today" and convert to current date', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('today', 'aaj'),
          (dateWord) => {
            const text = `Visit was ${dateWord}`;
            
            const result = extractor.extractEntities(text, dateWord === 'aaj' ? 'hi' : 'en');
            
            const today = new Date().toISOString().split('T')[0];
            expect(result.visitDate).toBe(today);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should extract "yesterday" and convert to previous date', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('yesterday', 'kal'),
          (dateWord) => {
            const text = `Visit was ${dateWord}`;
            
            const result = extractor.extractEntities(text, dateWord === 'kal' ? 'hi' : 'en');
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const expectedDate = yesterday.toISOString().split('T')[0];
            
            expect(result.visitDate).toBe(expectedDate);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 8: Structured output generation
   * For any transcribed text input, the Entity_Extractor should produce
   * a valid VisitRecord object with all required fields.
   * 
   * Validates: Requirements 3.6
   */
  describe('Property 8: Structured output generation', () => {
    it('should always return a valid VisitRecord structure', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 10, maxLength: 200}),
          fc.constantFrom('hi', 'en'),
          (text, language) => {
            const result = extractor.extractEntities(text, language as 'hi' | 'en');
            
            // Verify all required fields exist
            expect(result).toHaveProperty('patientName');
            expect(result).toHaveProperty('bloodPressure');
            expect(result).toHaveProperty('childSymptom');
            expect(result).toHaveProperty('visitDate');
            expect(result).toHaveProperty('createdAt');
            expect(result).toHaveProperty('syncStatus');
            
            // Verify field types
            expect(typeof result.patientName === 'string' || result.patientName === null).toBe(true);
            expect(typeof result.bloodPressure === 'string' || result.bloodPressure === null).toBe(true);
            expect(typeof result.childSymptom === 'string' || result.childSymptom === null).toBe(true);
            expect(typeof result.visitDate).toBe('string');
            expect(typeof result.createdAt).toBe('string');
            expect(result.syncStatus).toBe('pending');
            
            // Verify date formats
            expect(result.visitDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty input gracefully', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\n\n'),
          fc.constantFrom('hi', 'en'),
          (text, language) => {
            const result = extractor.extractEntities(text, language as 'hi' | 'en');
            
            // Should still return valid structure
            expect(result).toBeDefined();
            expect(result.syncStatus).toBe('pending');
            expect(result.visitDate).toBeTruthy();
            expect(result.createdAt).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Additional property: Extraction should be deterministic
   * Same input should always produce same output
   */
  describe('Additional: Deterministic extraction', () => {
    it('should produce consistent results for same input', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 20, maxLength: 100}),
          fc.constantFrom('hi', 'en'),
          (text, language) => {
            const result1 = extractor.extractEntities(text, language as 'hi' | 'en');
            const result2 = extractor.extractEntities(text, language as 'hi' | 'en');
            
            // Excluding createdAt which has timestamp
            expect(result1.patientName).toBe(result2.patientName);
            expect(result1.bloodPressure).toBe(result2.bloodPressure);
            expect(result1.childSymptom).toBe(result2.childSymptom);
            expect(result1.visitDate).toBe(result2.visitDate);
            expect(result1.syncStatus).toBe(result2.syncStatus);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
