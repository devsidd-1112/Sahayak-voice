/**
 * Visit Parser Service
 * 
 * Master orchestrator for the NLP pipeline.
 * Coordinates all extraction services to produce structured visit records.
 * 
 * Pipeline:
 * 1. Speech Cleaning
 * 2. Intent Detection
 * 3. Parallel Entity Extraction
 * 4. Medical Context Validation
 * 5. Structured Output
 * 
 * @module VisitParser
 */

import { VisitRecord, Language } from '../../types';
import { speechCleaner, CleanedSpeech } from './speechCleaner';
import { intentDetector, Intent, IntentResult } from './intentDetector';
import { symptomClassifier, SymptomResult } from './symptomClassifier';
import { bpParser, BPResult } from './bpParser';
import { nameExtractor, NameMatch } from './nameExtractor';

export interface ParseResult {
  visitRecord: VisitRecord;
  confidence: number;
  pipeline: {
    cleaned: CleanedSpeech;
    intent: IntentResult;
    name: NameMatch | null;
    bp: BPResult;
    symptoms: SymptomResult;
  };
  warnings: string[];
}

export class VisitParser {
  /**
   * Parse speech text into structured visit record
   * @param text - Raw speech-to-text output
   * @param language - Language of speech
   * @param userId - User ID for the record
   * @returns Parsed visit record with metadata
   */
  parse(text: string, language: Language, userId: string = ''): ParseResult {
    console.log('[VisitParser] ========================================');
    console.log('[VisitParser] Starting parse pipeline');
    console.log('[VisitParser] Input text:', text);
    console.log('[VisitParser] Language:', language);
    console.log('[VisitParser] ========================================');
    
    const warnings: string[] = [];
    
    // Step 1: Clean speech
    console.log('[VisitParser] Step 1: Cleaning speech...');
    const cleaned = speechCleaner.clean(text);
    
    // Step 2: Detect intent
    console.log('[VisitParser] Step 2: Detecting intent...');
    const intent = intentDetector.detect(cleaned.cleaned);
    
    // Step 3: Extract entities based on intent
    console.log('[VisitParser] Step 3: Extracting entities...');
    
    let textToProcess = cleaned.cleaned;
    
    // If mixed intent, process segments separately
    if (intent.intent === Intent.MIXED && intent.segments) {
      console.log('[VisitParser] Processing mixed intent segments...');
      return this.processMixedIntent(intent.segments, language, userId, cleaned, intent);
    }
    
    // Extract name
    console.log('[VisitParser] Extracting name...');
    const name = nameExtractor.extract(textToProcess);
    if (!name) {
      warnings.push('Patient name not found');
    }
    
    // Extract blood pressure
    console.log('[VisitParser] Extracting blood pressure...');
    const bp = bpParser.parse(textToProcess);
    if (!bp.isValid && bp.validationErrors.length > 0) {
      warnings.push(...bp.validationErrors);
    }
    
    // Extract symptoms
    console.log('[VisitParser] Extracting symptoms...');
    const symptoms = symptomClassifier.classify(textToProcess);
    if (symptoms.symptoms.length === 0) {
      warnings.push('No symptoms found');
    }
    
    // Step 4: Calculate overall confidence
    const confidence = this.calculateConfidence(name, bp, symptoms, intent);
    console.log('[VisitParser] Overall confidence:', confidence);
    
    // Step 5: Build visit record
    const visitRecord: VisitRecord = {
      patientName: name?.name || null,
      bloodPressure: bp.reading?.formatted || null,
      childSymptom: symptoms.symptoms.length > 0 ? symptoms.symptoms.join(', ') : null,
      visitDate: this.extractVisitDate(textToProcess),
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      userId
    };
    
    console.log('[VisitParser] ========================================');
    console.log('[VisitParser] Parse complete');
    console.log('[VisitParser] Visit record:', visitRecord);
    console.log('[VisitParser] Confidence:', confidence);
    console.log('[VisitParser] Warnings:', warnings);
    console.log('[VisitParser] ========================================');
    
    return {
      visitRecord,
      confidence,
      pipeline: {
        cleaned,
        intent,
        name,
        bp,
        symptoms
      },
      warnings
    };
  }

  /**
   * Process mixed intent by combining results from segments
   */
  private processMixedIntent(
    segments: Array<{ text: string; intent: Intent }>,
    language: Language,
    userId: string,
    cleaned: CleanedSpeech,
    intentResult: IntentResult
  ): ParseResult {
    console.log('[VisitParser] Processing', segments.length, 'segments');
    
    let name: NameMatch | null = null;
    let bp: BPResult = { reading: null, isValid: false, validationErrors: [] };
    let allSymptoms: string[] = [];
    const warnings: string[] = [];
    
    // Process each segment
    for (const segment of segments) {
      console.log(`[VisitParser] Processing segment (${segment.intent}):`, segment.text);
      
      switch (segment.intent) {
        case Intent.NAME:
        case Intent.VISIT:
          const extractedName = nameExtractor.extract(segment.text);
          if (extractedName && (!name || extractedName.confidence > name.confidence)) {
            name = extractedName;
          }
          break;
          
        case Intent.BP:
          const extractedBP = bpParser.parse(segment.text);
          if (extractedBP.isValid) {
            bp = extractedBP;
          }
          break;
          
        case Intent.SYMPTOM:
          const extractedSymptoms = symptomClassifier.classify(segment.text);
          allSymptoms.push(...extractedSymptoms.symptoms);
          break;
      }
    }
    
    // Deduplicate symptoms
    const uniqueSymptoms = Array.from(new Set(allSymptoms));
    
    const symptoms: SymptomResult = {
      symptoms: uniqueSymptoms,
      matches: [],
      hasMultiple: uniqueSymptoms.length > 1
    };
    
    // Add warnings
    if (!name) warnings.push('Patient name not found');
    if (!bp.isValid) warnings.push('Blood pressure not found or invalid');
    if (uniqueSymptoms.length === 0) warnings.push('No symptoms found');
    
    const confidence = this.calculateConfidence(name, bp, symptoms, intentResult);
    
    const visitRecord: VisitRecord = {
      patientName: name?.name || null,
      bloodPressure: bp.reading?.formatted || null,
      childSymptom: uniqueSymptoms.length > 0 ? uniqueSymptoms.join(', ') : null,
      visitDate: this.extractVisitDate(cleaned.cleaned),
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      userId
    };
    
    return {
      visitRecord,
      confidence,
      pipeline: {
        cleaned,
        intent: intentResult,
        name,
        bp,
        symptoms
      },
      warnings
    };
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(
    name: NameMatch | null,
    bp: BPResult,
    symptoms: SymptomResult,
    intent: IntentResult
  ): number {
    let score = 0;
    let maxScore = 0;
    
    // Name confidence (weight: 0.3)
    if (name) {
      score += name.confidence * 0.3;
    }
    maxScore += 0.3;
    
    // BP confidence (weight: 0.3)
    if (bp.isValid && bp.reading) {
      score += bp.reading.confidence * 0.3;
    }
    maxScore += 0.3;
    
    // Symptom confidence (weight: 0.3)
    if (symptoms.symptoms.length > 0) {
      const avgSymptomConfidence = symptoms.matches.reduce((sum, m) => sum + m.confidence, 0) / symptoms.matches.length;
      score += avgSymptomConfidence * 0.3;
    }
    maxScore += 0.3;
    
    // Intent confidence (weight: 0.1)
    score += intent.confidence * 0.1;
    maxScore += 0.1;
    
    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Extract visit date from text
   */
  private extractVisitDate(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Today keywords
    const todayKeywords = ['today', 'aaj', 'आज'];
    for (const keyword of todayKeywords) {
      if (lowerText.includes(keyword)) {
        return this.formatDate(new Date());
      }
    }
    
    // Yesterday keywords
    const yesterdayKeywords = ['yesterday', 'kal', 'कल'];
    for (const keyword of yesterdayKeywords) {
      if (lowerText.includes(keyword)) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.formatDate(yesterday);
      }
    }
    
    // Default to today
    return this.formatDate(new Date());
  }

  /**
   * Format date to ISO string
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Validate visit record completeness
   */
  validateRecord(record: VisitRecord): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    if (!record.patientName) missingFields.push('patientName');
    if (!record.bloodPressure) missingFields.push('bloodPressure');
    if (!record.childSymptom) missingFields.push('childSymptom');
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
}

// Export singleton instance
export const visitParser = new VisitParser();
