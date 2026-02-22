/**
 * Entity Extractor Service
 * 
 * Lightweight NLP component that extracts structured health data from transcribed text.
 * Uses pattern matching, regex, and keyword-based logic without cloud-based LLM APIs.
 * 
 * Supports both Hindi and English language inputs.
 */

import { VisitRecord, Language } from '../types';

export interface EntityExtractor {
  extractEntities(text: string, language: Language): VisitRecord;
}

/**
 * Simple pattern-based entity extractor for health visit records
 */
export class SimpleEntityExtractor implements EntityExtractor {
  // Regex patterns for entity extraction
  private readonly patterns = {
    // Blood pressure pattern: matches "140/90", "120\80", etc.
    bloodPressure: /\b(\d{2,3})[\/\\](\d{2,3})\b/,
    
    // Hindi name patterns: Look for names after common Hindi phrases
    hindiNameAfterPhrase: /(?:ke ghar|ki|ka)\s+([A-Z][a-z]+(?:\s+(?:Devi|Kumar|Singh|Sharma|Kumari|Bai))?)/i,
    
    // English name pattern: Capitalized first and last name
    englishName: /\b([A-Z][a-z]+\s+(?:Devi|Kumar|Singh|Sharma|Kumari|Bai|[A-Z][a-z]+))\b/,
    
    // Generic capitalized name pattern (fallback)
    capitalizedName: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
  };

  // Symptom keywords for child health
  private readonly symptoms = {
    hi: [
      'bukhar',    // fever
      'khansi',    // cough
      'dast',      // diarrhea
      'ulti',      // vomiting
      'thand',     // cold
      'jukam',     // cold/flu
      'pet dard',  // stomach ache
      'sir dard',  // headache
    ],
    en: [
      'fever',
      'cough',
      'diarrhea',
      'vomiting',
      'cold',
      'flu',
      'stomach ache',
      'headache',
      'runny nose',
    ],
  };

  // Date keywords
  private readonly dateKeywords = {
    today: ['aaj', 'today'],
    yesterday: ['kal', 'yesterday', 'parso'],
  };

  /**
   * Extract structured entities from transcribed text
   * @param text - Transcribed speech text
   * @param language - Language of the text ('hi' for Hindi, 'en' for English)
   * @returns VisitRecord with extracted entities
   */
  extractEntities(text: string, language: Language): VisitRecord {
    const patientName = this.extractPatientName(text, language);
    const bloodPressure = this.extractBloodPressure(text);
    const childSymptom = this.extractChildSymptom(text, language);
    const visitDate = this.extractVisitDate(text);
    
    return {
      patientName,
      bloodPressure,
      childSymptom,
      visitDate,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      userId: '', // Will be set by the caller
    };
  }

  /**
   * Extract patient name from text
   * Uses language-specific patterns to identify names
   */
  private extractPatientName(text: string, language: Language): string | null {
    if (language === 'hi') {
      // Try Hindi-specific patterns first (names after "ke ghar", "ki", "ka")
      const hindiMatch = text.match(this.patterns.hindiNameAfterPhrase);
      if (hindiMatch) {
        return this.capitalizeWords(hindiMatch[1].trim());
      }
    }
    
    // Try English/common name patterns
    const englishMatch = text.match(this.patterns.englishName);
    if (englishMatch) {
      return this.capitalizeWords(englishMatch[1].trim());
    }
    
    // Fallback: Look for any capitalized words (might be a name)
    const capitalizedMatch = text.match(this.patterns.capitalizedName);
    if (capitalizedMatch) {
      // Filter out common non-name words
      const commonWords = ['Today', 'Yesterday', 'Aaj', 'Kal', 'The', 'This', 'That'];
      const potentialName = capitalizedMatch[1].trim();
      if (!commonWords.includes(potentialName)) {
        return this.capitalizeWords(potentialName);
      }
    }
    
    return null;
  }

  /**
   * Extract blood pressure reading from text
   * Looks for pattern like "140/90" or "120\80"
   */
  private extractBloodPressure(text: string): string | null {
    const match = text.match(this.patterns.bloodPressure);
    if (match) {
      // Normalize to forward slash format
      return `${match[1]}/${match[2]}`;
    }
    return null;
  }

  /**
   * Extract child symptom from text
   * Uses keyword matching for common symptoms
   */
  private extractChildSymptom(text: string, language: Language): string | null {
    const lowerText = text.toLowerCase();
    const symptomList = this.symptoms[language];
    
    // Check for each symptom keyword
    for (const symptom of symptomList) {
      if (lowerText.includes(symptom.toLowerCase())) {
        // Return capitalized symptom
        return this.capitalizeWords(symptom);
      }
    }
    
    // Check for symptoms in the other language as well (mixed language support)
    const otherLanguage = language === 'hi' ? 'en' : 'hi';
    const otherSymptomList = this.symptoms[otherLanguage];
    
    for (const symptom of otherSymptomList) {
      if (lowerText.includes(symptom.toLowerCase())) {
        return this.capitalizeWords(symptom);
      }
    }
    
    return null;
  }

  /**
   * Extract visit date from text
   * Recognizes keywords like "aaj" (today), "kal" (yesterday)
   * Defaults to current date if not specified
   */
  private extractVisitDate(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Check for "today" keywords
    for (const keyword of this.dateKeywords.today) {
      if (lowerText.includes(keyword)) {
        return this.formatDate(new Date());
      }
    }
    
    // Check for "yesterday" keywords
    for (const keyword of this.dateKeywords.yesterday) {
      if (lowerText.includes(keyword)) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.formatDate(yesterday);
      }
    }
    
    // Default to today's date
    return this.formatDate(new Date());
  }

  /**
   * Format date to ISO date string (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Capitalize first letter of each word
   */
  private capitalizeWords(text: string): string {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

// Export singleton instance
export const entityExtractor = new SimpleEntityExtractor();
