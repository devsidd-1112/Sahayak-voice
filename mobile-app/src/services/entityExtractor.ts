/**
 * Entity Extractor Service
 * 
 * Lightweight NLP component that extracts structured health data from transcribed text.
 * Uses pattern matching, regex, and keyword-based logic without cloud-based LLM APIs.
 * 
 * Supports both Hindi and English language inputs with natural speech patterns.
 */

import { VisitRecord, Language } from '../types';

export interface EntityExtractor {
  extractEntities(text: string, language: Language): VisitRecord;
}

/**
 * Comprehensive pattern-based entity extractor for health visit records
 * Handles natural speech patterns used by ASHA workers
 */
export class SimpleEntityExtractor implements EntityExtractor {
  // Blood pressure keywords in multiple languages
  private readonly bpKeywords = [
    'bp', 'b p', 'blood pressure', 'pressure',
    'रक्तचाप', 'ब्लड प्रेशर', 'बीपी'
  ];

  // Name indicator phrases
  private readonly nameIndicators = {
    en: [
      'patient name is', 'patient is', 'name is', 'visited',
      'met', 'saw', 'patient', 'name'
    ],
    hi: [
      'मरीज का नाम', 'नाम है', 'मिली', 'गई', 'के घर', 'की', 'का'
    ]
  };

  // Child/baby keywords
  private readonly childKeywords = [
    'baby', 'child', 'infant', 'kid', 'son', 'daughter',
    'bachcha', 'bacchi', 'बच्चा', 'बच्ची', 'शिशु'
  ];

  // Symptom keywords with variations
  private readonly symptoms = {
    fever: {
      en: ['fever', 'temperature', 'hot', 'burning'],
      hi: ['बुखार', 'bukhar', 'तापमान', 'गर्मी']
    },
    cough: {
      en: ['cough', 'coughing'],
      hi: ['खांसी', 'khansi', 'खासी']
    },
    cold: {
      en: ['cold', 'runny nose', 'sneezing', 'sneeze'],
      hi: ['सर्दी', 'thand', 'जुकाम', 'jukam', 'छींक']
    },
    diarrhea: {
      en: ['diarrhea', 'loose motion', 'loose stool', 'stomach upset'],
      hi: ['दस्त', 'dast', 'पेट खराब', 'लूज मोशन']
    },
    vomiting: {
      en: ['vomiting', 'vomit', 'throwing up', 'puke'],
      hi: ['उल्टी', 'ulti', 'वमन']
    },
    stomachache: {
      en: ['stomach ache', 'stomach pain', 'belly ache', 'tummy ache', 'abdominal pain'],
      hi: ['पेट दर्द', 'pet dard', 'पेट में दर्द']
    },
    headache: {
      en: ['headache', 'head pain'],
      hi: ['सिर दर्द', 'sir dard', 'सिर में दर्द']
    },
    weakness: {
      en: ['weakness', 'weak', 'tired', 'fatigue'],
      hi: ['कमजोरी', 'kamzori', 'थकान', 'कमज़ोर']
    },
    rash: {
      en: ['rash', 'skin rash', 'itching', 'itch'],
      hi: ['दाने', 'खुजली', 'चकत्ते']
    }
  };

  /**
   * Extract structured entities from transcribed text
   * @param text - Transcribed speech text
   * @param language - Language of the text ('hi' for Hindi, 'en' for English)
   * @returns VisitRecord with extracted entities
   */
  extractEntities(text: string, language: Language): VisitRecord {
    console.log('[EntityExtractor] ========================================');
    console.log('[EntityExtractor] Extracting entities from text:', text);
    console.log('[EntityExtractor] Language:', language);
    
    const patientName = this.extractPatientName(text, language);
    console.log('[EntityExtractor] Patient name:', patientName || '(not found)');
    
    const bloodPressure = this.extractBloodPressure(text);
    console.log('[EntityExtractor] Blood pressure:', bloodPressure || '(not found)');
    
    const childSymptom = this.extractChildSymptom(text, language);
    console.log('[EntityExtractor] Child symptom:', childSymptom || '(not found)');
    
    const visitDate = this.extractVisitDate(text);
    console.log('[EntityExtractor] Visit date:', visitDate);
    console.log('[EntityExtractor] ========================================');
    
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
   * Handles multiple natural speech patterns
   */
  private extractPatientName(text: string, language: Language): string | null {
    console.log('[EntityExtractor] Extracting patient name...');
    
    // Pattern 1: "patient name is Priya", "name is Anjali"
    const nameIsPattern = /(?:patient\s+)?name\s+(?:is|hai)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
    let match = text.match(nameIsPattern);
    if (match) {
      console.log('[EntityExtractor] Found name with "name is" pattern:', match[1]);
      return this.capitalizeWords(match[1].trim());
    }

    // Pattern 2: "visited Priya", "met Sunita", "saw Meera"
    const visitedPattern = /(?:visited|met|saw|gai|mili)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
    match = text.match(visitedPattern);
    if (match) {
      console.log('[EntityExtractor] Found name with "visited/met" pattern:', match[1]);
      return this.capitalizeWords(match[1].trim());
    }

    // Pattern 3: "patient Kavita", "patient is Pooja"
    const patientPattern = /patient\s+(?:is\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
    match = text.match(patientPattern);
    if (match) {
      console.log('[EntityExtractor] Found name with "patient" pattern:', match[1]);
      return this.capitalizeWords(match[1].trim());
    }

    // Pattern 4: Hindi patterns - "Priya ke ghar", "Sunita ki"
    const hindiPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:ke ghar|ki|ka|ko)/i;
    match = text.match(hindiPattern);
    if (match) {
      console.log('[EntityExtractor] Found name with Hindi pattern:', match[1]);
      return this.capitalizeWords(match[1].trim());
    }

    // Pattern 5: Look for capitalized words (likely names)
    // Filter out common non-name words
    const words = text.split(/\s+/);
    const commonWords = [
      'Today', 'Yesterday', 'Aaj', 'Kal', 'The', 'This', 'That', 'Blood', 'Pressure',
      'Baby', 'Child', 'Fever', 'Cough', 'Patient', 'Name', 'Is', 'Has', 'And', 'Or'
    ];
    
    for (const word of words) {
      if (/^[A-Z][a-z]+$/.test(word) && !commonWords.includes(word)) {
        console.log('[EntityExtractor] Found capitalized word (potential name):', word);
        return this.capitalizeWords(word);
      }
    }
    
    console.log('[EntityExtractor] No name found');
    return null;
  }

  /**
   * Extract blood pressure reading from text
   * Handles all natural speech patterns for BP
   */
  private extractBloodPressure(text: string): string | null {
    console.log('[EntityExtractor] Extracting blood pressure...');
    const lowerText = text.toLowerCase();
    
    // Pattern 1: Look for BP keywords followed by numbers
    for (const keyword of this.bpKeywords) {
      const keywordIndex = lowerText.indexOf(keyword);
      if (keywordIndex !== -1) {
        const afterKeyword = text.substring(keywordIndex);
        
        // Try multiple number patterns
        const patterns = [
          // "120/80", "120\80"
          /(\d{2,3})\s*[\/\\]\s*(\d{2,3})/,
          // "120 over 80", "120 by 80"
          /(\d{2,3})\s+(?:over|by)\s+(\d{2,3})/i,
          // "120 80" (two numbers with space)
          /(\d{2,3})\s+(\d{2,3})/,
          // "is 120 80", "hai 120 80"
          /(?:is|hai)\s+(\d{2,3})\s+(\d{2,3})/i
        ];
        
        for (const pattern of patterns) {
          const match = afterKeyword.match(pattern);
          if (match) {
            const systolic = parseInt(match[1]);
            const diastolic = parseInt(match[2]);
            
            // Validate BP range (systolic: 80-200, diastolic: 40-130)
            if (systolic >= 80 && systolic <= 200 && diastolic >= 40 && diastolic <= 130) {
              console.log('[EntityExtractor] Found BP with keyword:', `${systolic}/${diastolic}`);
              return `${systolic}/${diastolic}`;
            }
          }
        }
      }
    }
    
    // Pattern 2: Look for two numbers that look like BP (without keyword)
    const patterns = [
      /\b(\d{2,3})\s*[\/\\]\s*(\d{2,3})\b/,
      /\b(\d{2,3})\s+(?:over|by)\s+(\d{2,3})\b/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const systolic = parseInt(match[1]);
        const diastolic = parseInt(match[2]);
        
        if (systolic >= 80 && systolic <= 200 && diastolic >= 40 && diastolic <= 130) {
          console.log('[EntityExtractor] Found BP without keyword:', `${systolic}/${diastolic}`);
          return `${systolic}/${diastolic}`;
        }
      }
    }
    
    console.log('[EntityExtractor] No blood pressure found');
    return null;
  }

  /**
   * Extract child symptom from text
   * Handles natural speech patterns with child/baby keywords
   */
  private extractChildSymptom(text: string, language: Language): string | null {
    console.log('[EntityExtractor] Extracting child symptom...');
    const lowerText = text.toLowerCase();
    
    // Check each symptom category
    for (const [symptomName, translations] of Object.entries(this.symptoms)) {
      const allKeywords = [...translations.en, ...translations.hi];
      
      for (const keyword of allKeywords) {
        const keywordLower = keyword.toLowerCase();
        
        // Pattern 1: Direct mention - "fever", "cough"
        if (lowerText.includes(keywordLower)) {
          console.log('[EntityExtractor] Found symptom (direct):', symptomName);
          return this.capitalizeWords(symptomName);
        }
        
        // Pattern 2: "has fever", "has cough"
        const hasPattern = new RegExp(`has\\s+${keywordLower}|${keywordLower}\\s+hai`, 'i');
        if (hasPattern.test(lowerText)) {
          console.log('[EntityExtractor] Found symptom (has pattern):', symptomName);
          return this.capitalizeWords(symptomName);
        }
        
        // Pattern 3: "baby has fever", "child has cough"
        for (const childWord of this.childKeywords) {
          const childPattern = new RegExp(`${childWord}\\s+(?:has|hai)\\s+${keywordLower}`, 'i');
          if (childPattern.test(lowerText)) {
            console.log('[EntityExtractor] Found symptom (child has pattern):', symptomName);
            return this.capitalizeWords(symptomName);
          }
        }
        
        // Pattern 4: "fever in baby", "cough in child"
        const inPattern = new RegExp(`${keywordLower}\\s+(?:in|to|ko)\\s+(?:${this.childKeywords.join('|')})`, 'i');
        if (inPattern.test(lowerText)) {
          console.log('[EntityExtractor] Found symptom (in child pattern):', symptomName);
          return this.capitalizeWords(symptomName);
        }
      }
    }
    
    // Pattern 5: Extract symptom from "baby/child has X" where X is unknown
    const childHasPattern = new RegExp(`(?:${this.childKeywords.join('|')})\\s+(?:has|hai)\\s+(\\w+)`, 'i');
    const match = lowerText.match(childHasPattern);
    if (match && match[1]) {
      const potentialSymptom = match[1];
      console.log('[EntityExtractor] Found potential symptom from child has pattern:', potentialSymptom);
      
      // Check if it matches any known symptom
      for (const [symptomName, translations] of Object.entries(this.symptoms)) {
        const allKeywords = [...translations.en, ...translations.hi];
        for (const keyword of allKeywords) {
          if (keyword.toLowerCase().includes(potentialSymptom) || 
              potentialSymptom.includes(keyword.toLowerCase())) {
            console.log('[EntityExtractor] Matched to known symptom:', symptomName);
            return this.capitalizeWords(symptomName);
          }
        }
      }
      
      // Return the captured word as-is if no match
      return this.capitalizeWords(potentialSymptom);
    }
    
    console.log('[EntityExtractor] No symptom found');
    return null;
  }

  /**
   * Extract visit date from text
   * Recognizes date keywords in multiple languages
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
    const yesterdayKeywords = ['yesterday', 'kal', 'कल', 'parso', 'परसों'];
    for (const keyword of yesterdayKeywords) {
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
