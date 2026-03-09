/**
 * Symptom Classifier Service
 * 
 * Advanced symptom detection supporting:
 * - Multiple symptoms in one sentence
 * - Hindi, Hinglish, and English
 * - Contextual matching (baby has X, child has Y)
 * - Synonym and variation handling
 * 
 * @module SymptomClassifier
 */

export interface SymptomMatch {
  symptom: string;
  confidence: number;
  matchedKeyword: string;
  context?: string;
}

export interface SymptomResult {
  symptoms: string[];
  matches: SymptomMatch[];
  hasMultiple: boolean;
}

export class SymptomClassifier {
  // Comprehensive symptom dictionary with variations
  private readonly symptomDictionary = {
    fever: {
      canonical: 'fever',
      keywords: [
        'fever', 'fevar', 'feverish',
        'bukhar', 'bukhaar', 'bukharr', 'buxar',
        'temperature', 'temp', 'temprature', 'high temp',
        'तापमान', 'बुखार', 'गर्मी'
      ],
      weight: 1.0
    },
    cough: {
      canonical: 'cough',
      keywords: [
        'cough', 'coughing', 'coff',
        'khansi', 'khasi', 'khaasi', 'kaansi',
        'खांसी', 'खासी'
      ],
      weight: 1.0
    },
    cold: {
      canonical: 'cold',
      keywords: [
        'cold', 'runny nose', 'sneezing', 'sneeze',
        'sardi', 'thand', 'thandi', 'jukam', 'jukaam', 'zukam',
        'सर्दी', 'जुकाम', 'छींक'
      ],
      weight: 1.0
    },
    diarrhea: {
      canonical: 'diarrhea',
      keywords: [
        'diarrhea', 'diarrhoea', 'loose motion', 'loose motions', 'loose stool',
        'stomach upset', 'upset stomach',
        'dast', 'daast', 'pet kharab', 'pet loose',
        'दस्त', 'पेट खराब', 'लूज मोशन'
      ],
      weight: 1.0
    },
    vomiting: {
      canonical: 'vomiting',
      keywords: [
        'vomiting', 'vomit', 'vommit', 'throwing up', 'throw up', 'puke',
        'ulti', 'vaman',
        'उल्टी', 'वमन'
      ],
      weight: 1.0
    },
    weakness: {
      canonical: 'weakness',
      keywords: [
        'weakness', 'weak', 'tired', 'fatigue', 'exhausted',
        'kamzori', 'kamjori', 'kamzory', 'kamzor', 'thakan',
        'कमजोरी', 'थकान', 'कमज़ोर'
      ],
      weight: 0.9
    },
    stomachache: {
      canonical: 'stomach ache',
      keywords: [
        'stomach ache', 'stomach pain', 'belly ache', 'tummy ache',
        'abdominal pain', 'stomach cramp',
        'pet dard', 'pet mein dard', 'pet ka dard',
        'पेट दर्द', 'पेट में दर्द'
      ],
      weight: 1.0
    },
    headache: {
      canonical: 'headache',
      keywords: [
        'headache', 'head ache', 'head pain', 'migraine',
        'sir dard', 'sir mein dard', 'sir ka dard',
        'सिर दर्द', 'सिर में दर्द'
      ],
      weight: 0.9
    },
    rash: {
      canonical: 'rash',
      keywords: [
        'rash', 'skin rash', 'itching', 'itch', 'scratching',
        'khujli', 'daane', 'chakatte',
        'दाने', 'खुजली', 'चकत्ते'
      ],
      weight: 0.9
    },
    bodyache: {
      canonical: 'body ache',
      keywords: [
        'body ache', 'body pain', 'muscle pain', 'joint pain',
        'badan dard', 'sharir dard',
        'बदन दर्द', 'शरीर दर्द'
      ],
      weight: 0.8
    },
    breathingproblem: {
      canonical: 'breathing problem',
      keywords: [
        'breathing problem', 'difficulty breathing', 'breathless',
        'shortness of breath', 'cant breathe',
        'saans ki takleef', 'saans lene mein dikkat',
        'सांस की तकलीफ'
      ],
      weight: 1.0
    }
  };

  // Context keywords for child health
  private readonly childContextKeywords = [
    'baby', 'child', 'infant', 'kid', 'son', 'daughter',
    'baccha', 'bachcha', 'bacha', 'bacchi', 'bachchi', 'bachi',
    'shishu', 'बच्चा', 'बच्ची', 'शिशु'
  ];

  // Connector words that indicate multiple symptoms
  private readonly connectors = ['and', 'aur', 'or', 'ya', 'with', 'ke saath', 'also', 'bhi'];

  /**
   * Classify symptoms from text
   * @param text - Cleaned speech text
   * @returns Symptom classification result
   */
  classify(text: string): SymptomResult {
    console.log('[SymptomClassifier] Classifying symptoms in:', text);
    
    const lowerText = text.toLowerCase();
    const matches: SymptomMatch[] = [];
    
    // Check each symptom in dictionary
    for (const [symptomKey, config] of Object.entries(this.symptomDictionary)) {
      for (const keyword of config.keywords) {
        const keywordLower = keyword.toLowerCase();
        
        // Check for exact match or word boundary match
        const regex = new RegExp(`\\b${this.escapeRegex(keywordLower)}\\b`, 'i');
        
        if (regex.test(lowerText)) {
          // Extract context around the match
          const context = this.extractContext(lowerText, keywordLower);
          
          // Calculate confidence based on context
          let confidence = config.weight;
          
          // Boost confidence if child context is present
          if (this.hasChildContext(context)) {
            confidence += 0.1;
          }
          
          // Boost confidence for multi-word matches
          if (keyword.includes(' ')) {
            confidence += 0.1;
          }
          
          matches.push({
            symptom: config.canonical,
            confidence: Math.min(confidence, 1.0),
            matchedKeyword: keyword,
            context
          });
          
          console.log(`[SymptomClassifier] Found: ${config.canonical} (keyword: ${keyword})`);
          
          // Break after first match for this symptom
          break;
        }
      }
    }
    
    // Remove duplicate symptoms (keep highest confidence)
    const uniqueSymptoms = this.deduplicateSymptoms(matches);
    
    // Sort by confidence
    uniqueSymptoms.sort((a, b) => b.confidence - a.confidence);
    
    const symptoms = uniqueSymptoms.map(m => m.symptom);
    const hasMultiple = symptoms.length > 1;
    
    console.log('[SymptomClassifier] Found symptoms:', symptoms);
    console.log('[SymptomClassifier] Multiple symptoms:', hasMultiple);
    
    return {
      symptoms,
      matches: uniqueSymptoms,
      hasMultiple
    };
  }

  /**
   * Extract context around a keyword match
   * @param text - Full text
   * @param keyword - Matched keyword
   * @returns Context string
   */
  private extractContext(text: string, keyword: string): string {
    const index = text.indexOf(keyword);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + keyword.length + 30);
    
    return text.substring(start, end);
  }

  /**
   * Check if context contains child-related keywords
   * @param context - Context string
   * @returns True if child context found
   */
  private hasChildContext(context: string): boolean {
    const lowerContext = context.toLowerCase();
    return this.childContextKeywords.some(keyword => lowerContext.includes(keyword));
  }

  /**
   * Remove duplicate symptoms, keeping highest confidence
   * @param matches - All symptom matches
   * @returns Deduplicated matches
   */
  private deduplicateSymptoms(matches: SymptomMatch[]): SymptomMatch[] {
    const symptomMap = new Map<string, SymptomMatch>();
    
    for (const match of matches) {
      const existing = symptomMap.get(match.symptom);
      if (!existing || match.confidence > existing.confidence) {
        symptomMap.set(match.symptom, match);
      }
    }
    
    return Array.from(symptomMap.values());
  }

  /**
   * Escape special regex characters
   * @param str - String to escape
   * @returns Escaped string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get all supported symptoms
   * @returns Array of canonical symptom names
   */
  getSupportedSymptoms(): string[] {
    return Object.values(this.symptomDictionary).map(s => s.canonical);
  }

  /**
   * Add custom symptom to dictionary
   * @param canonical - Canonical symptom name
   * @param keywords - Array of keyword variations
   * @param weight - Confidence weight (0-1)
   */
  addSymptom(canonical: string, keywords: string[], weight: number = 1.0): void {
    (this.symptomDictionary as any)[canonical.toLowerCase().replace(/\s+/g, '')] = {
      canonical,
      keywords,
      weight
    };
    console.log(`[SymptomClassifier] Added symptom: ${canonical}`);
  }
}

// Export singleton instance
export const symptomClassifier = new SymptomClassifier();
