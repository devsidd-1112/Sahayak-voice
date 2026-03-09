/**
 * Intent Detector Service
 * 
 * Detects the intent/purpose of speech segments.
 * Helps route text to appropriate entity extractors.
 * 
 * Intents:
 * - VISIT: Patient visit information
 * - BP: Blood pressure measurement
 * - SYMPTOM: Child health symptoms
 * - NAME: Patient name
 * - UNKNOWN: Cannot determine intent
 * 
 * @module IntentDetector
 */

export enum Intent {
  VISIT = 'VISIT',
  BP = 'BP',
  SYMPTOM = 'SYMPTOM',
  NAME = 'NAME',
  MIXED = 'MIXED',
  UNKNOWN = 'UNKNOWN'
}

export interface IntentResult {
  intent: Intent;
  confidence: number;
  matchedKeywords: string[];
  segments?: Array<{ text: string; intent: Intent }>;
}

export class IntentDetector {
  // Intent keyword patterns
  private readonly intentPatterns = {
    VISIT: {
      keywords: [
        'visited', 'met', 'saw', 'ghar', 'gayi', 'gaya', 'gaye',
        'mili', 'mila', 'mile', 'dekha', 'dekhi', 'dekhe',
        'ke ghar', 'ke paas', 'se mili'
      ],
      weight: 1.0
    },
    BP: {
      keywords: [
        'bp', 'blood pressure', 'pressure', 'raktchaap',
        'systolic', 'diastolic', 'over', 'by'
      ],
      weight: 1.0
    },
    SYMPTOM: {
      keywords: [
        'fever', 'bukhar', 'cough', 'khansi', 'cold', 'sardi', 'jukam',
        'diarrhea', 'dast', 'vomiting', 'ulti', 'weakness', 'kamzori',
        'headache', 'sir dard', 'stomach', 'pet', 'rash', 'khujli',
        'baby', 'child', 'baccha', 'bachcha', 'shishu',
        'symptom', 'problem', 'issue', 'complaint', 'takleef'
      ],
      weight: 1.0
    },
    NAME: {
      keywords: [
        'name', 'naam', 'patient', 'mareez', 'marij'
      ],
      weight: 0.8
    }
  };

  // Number patterns for BP detection
  private readonly numberPattern = /\b\d{2,3}\b/g;

  /**
   * Detect intent from cleaned text
   * @param text - Cleaned speech text
   * @returns Intent result with confidence
   */
  detect(text: string): IntentResult {
    console.log('[IntentDetector] Detecting intent for:', text);
    
    const lowerText = text.toLowerCase();
    const scores: Record<Intent, number> = {
      [Intent.VISIT]: 0,
      [Intent.BP]: 0,
      [Intent.SYMPTOM]: 0,
      [Intent.NAME]: 0,
      [Intent.MIXED]: 0,
      [Intent.UNKNOWN]: 0
    };
    
    const matchedKeywords: string[] = [];
    
    // Score each intent based on keyword matches
    for (const [intent, config] of Object.entries(this.intentPatterns)) {
      for (const keyword of config.keywords) {
        if (lowerText.includes(keyword)) {
          scores[intent as Intent] += config.weight;
          matchedKeywords.push(keyword);
        }
      }
    }
    
    // Boost BP score if numbers are present
    const numbers = lowerText.match(this.numberPattern);
    if (numbers && numbers.length >= 2) {
      scores[Intent.BP] += 1.5;
      console.log('[IntentDetector] Found numbers, boosting BP score');
    }
    
    // Determine primary intent
    const intents = Object.entries(scores)
      .filter(([intent, score]) => intent !== Intent.MIXED && intent !== Intent.UNKNOWN && score > 0)
      .sort((a, b) => b[1] - a[1]);
    
    console.log('[IntentDetector] Intent scores:', scores);
    
    // If multiple intents detected, mark as MIXED
    if (intents.length > 1 && intents[0][1] > 0 && intents[1][1] > 0) {
      const topScore = intents[0][1];
      const secondScore = intents[1][1];
      
      // If scores are close, it's a mixed intent
      if (secondScore / topScore > 0.5) {
        console.log('[IntentDetector] Multiple intents detected: MIXED');
        return {
          intent: Intent.MIXED,
          confidence: topScore / (topScore + secondScore),
          matchedKeywords,
          segments: this.segmentText(text, intents.map(([intent]) => intent as Intent))
        };
      }
    }
    
    // Return primary intent
    if (intents.length > 0 && intents[0][1] > 0) {
      const primaryIntent = intents[0][0] as Intent;
      const confidence = intents[0][1] / (intents.reduce((sum, [, score]) => sum + score, 0) || 1);
      
      console.log('[IntentDetector] Primary intent:', primaryIntent, 'confidence:', confidence);
      
      return {
        intent: primaryIntent,
        confidence,
        matchedKeywords
      };
    }
    
    // Unknown intent
    console.log('[IntentDetector] Unknown intent');
    return {
      intent: Intent.UNKNOWN,
      confidence: 0,
      matchedKeywords: []
    };
  }

  /**
   * Segment text into multiple intents
   * Used when MIXED intent is detected
   * @param text - Input text
   * @param intents - Detected intents
   * @returns Text segments with their intents
   */
  private segmentText(text: string, intents: Intent[]): Array<{ text: string; intent: Intent }> {
    const segments: Array<{ text: string; intent: Intent }> = [];
    const sentences = text.split(/[।.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      const result = this.detect(sentence.trim());
      if (result.intent !== Intent.UNKNOWN && result.intent !== Intent.MIXED) {
        segments.push({
          text: sentence.trim(),
          intent: result.intent
        });
      }
    }
    
    console.log('[IntentDetector] Segmented into', segments.length, 'parts');
    return segments;
  }

  /**
   * Check if text contains multiple intents
   * @param text - Input text
   * @returns True if multiple intents detected
   */
  isMixed(text: string): boolean {
    const result = this.detect(text);
    return result.intent === Intent.MIXED;
  }
}

// Export singleton instance
export const intentDetector = new IntentDetector();
