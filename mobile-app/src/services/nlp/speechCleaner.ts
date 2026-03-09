/**
 * Speech Cleaner Service
 * 
 * Cleans and normalizes speech-to-text output for better entity extraction.
 * Handles:
 * - Filler word removal
 * - Hinglish normalization
 * - Spelling variations
 * - Noise reduction
 * 
 * @module SpeechCleaner
 */

export interface CleanedSpeech {
  original: string;
  cleaned: string;
  removedFillers: string[];
  normalizations: Array<{ from: string; to: string }>;
}

export class SpeechCleaner {
  // Filler words to remove (Hindi + English)
  private readonly fillerWords = [
    // English fillers
    'umm', 'uh', 'uhh', 'hmm', 'hmmm', 'err', 'ahh', 'like', 'you know',
    // Hindi fillers
    'haan', 'han', 'achha', 'acha', 'thik', 'theek', 'toh', 'to', 'matlab',
    'yaani', 'yani', 'bas', 'arre', 'are', 'woh', 'wo', 'yeh', 'ye'
  ];

  // Hinglish and spelling variations normalization map
  private readonly normalizationMap: Record<string, string> = {
    // Fever variations
    'bukhaar': 'bukhar',
    'bukharr': 'bukhar',
    'buxar': 'bukhar',
    'temp': 'temperature',
    'temprature': 'temperature',
    
    // Cough variations
    'khasi': 'khansi',
    'khaasi': 'khansi',
    'kaansi': 'khansi',
    'coff': 'cough',
    
    // Cold variations
    'thand': 'sardi',
    'thandi': 'sardi',
    'jukaam': 'jukam',
    'zukam': 'jukam',
    'runny nose': 'cold',
    
    // Diarrhea variations
    'dast': 'diarrhea',
    'daast': 'diarrhea',
    'loose motion': 'diarrhea',
    'loose motions': 'diarrhea',
    'pet kharab': 'diarrhea',
    
    // Vomiting variations
    'ulti': 'vomiting',
    'vomit': 'vomiting',
    'vommit': 'vomiting',
    'throwing up': 'vomiting',
    
    // Weakness variations
    'kamzori': 'weakness',
    'kamjori': 'weakness',
    'kamzory': 'weakness',
    'weak': 'weakness',
    
    // Blood pressure variations
    'b p': 'bp',
    'b.p': 'bp',
    'b.p.': 'bp',
    'blood pressure': 'bp',
    'raktchaap': 'bp',
    'raktchap': 'bp',
    
    // Common word variations
    'baccha': 'baby',
    'bachcha': 'baby',
    'bacha': 'baby',
    'bacchi': 'baby',
    'bachchi': 'baby',
    'bachi': 'baby',
    'shishu': 'baby',
    'child': 'baby',
    'kid': 'baby',
    
    // Visit variations
    'ghar gaya': 'visited',
    'ghar gayi': 'visited',
    'ghar gaye': 'visited',
    'se mila': 'met',
    'se mili': 'met',
    'se mile': 'met',
    'dekha': 'saw',
    'dekhi': 'saw',
    'dekhe': 'saw',
    
    // Date variations
    'aaj': 'today',
    'kal': 'yesterday',
    'parso': 'day before yesterday',
    
    // Common misspellings
    'presha': 'pressure',
    'presure': 'pressure',
    'preasure': 'pressure',
  };

  // Words that should be preserved (medical terms, names)
  private readonly preserveWords = [
    'priya', 'sunita', 'kavita', 'anjali', 'meera', 'pooja', 'rekha',
    'devi', 'kumar', 'singh', 'sharma', 'kumari', 'bai'
  ];

  /**
   * Clean and normalize speech text
   * @param text - Raw speech-to-text output
   * @returns Cleaned speech with metadata
   */
  clean(text: string): CleanedSpeech {
    console.log('[SpeechCleaner] Cleaning text:', text);
    
    const original = text;
    const removedFillers: string[] = [];
    const normalizations: Array<{ from: string; to: string }> = [];
    
    let cleaned = text.toLowerCase().trim();
    
    // Step 1: Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Step 2: Remove filler words
    for (const filler of this.fillerWords) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      if (regex.test(cleaned)) {
        removedFillers.push(filler);
        cleaned = cleaned.replace(regex, ' ');
      }
    }
    
    // Step 3: Normalize Hinglish and variations
    const words = cleaned.split(/\s+/);
    const normalizedWords = words.map(word => {
      // Preserve important words
      if (this.preserveWords.includes(word.toLowerCase())) {
        return word;
      }
      
      // Check normalization map
      const normalized = this.normalizationMap[word.toLowerCase()];
      if (normalized) {
        normalizations.push({ from: word, to: normalized });
        return normalized;
      }
      
      return word;
    });
    
    cleaned = normalizedWords.join(' ');
    
    // Step 4: Handle multi-word normalizations
    for (const [key, value] of Object.entries(this.normalizationMap)) {
      if (key.includes(' ')) {
        const regex = new RegExp(key, 'gi');
        if (regex.test(cleaned)) {
          normalizations.push({ from: key, to: value });
          cleaned = cleaned.replace(regex, value);
        }
      }
    }
    
    // Step 5: Clean up extra spaces again
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    console.log('[SpeechCleaner] Cleaned text:', cleaned);
    console.log('[SpeechCleaner] Removed fillers:', removedFillers);
    console.log('[SpeechCleaner] Normalizations:', normalizations.length);
    
    return {
      original,
      cleaned,
      removedFillers,
      normalizations
    };
  }

  /**
   * Add custom normalization rule
   * @param from - Original word/phrase
   * @param to - Normalized word/phrase
   */
  addNormalization(from: string, to: string): void {
    this.normalizationMap[from.toLowerCase()] = to.toLowerCase();
    console.log(`[SpeechCleaner] Added normalization: ${from} → ${to}`);
  }

  /**
   * Add custom filler word
   * @param filler - Filler word to remove
   */
  addFillerWord(filler: string): void {
    this.fillerWords.push(filler.toLowerCase());
    console.log(`[SpeechCleaner] Added filler word: ${filler}`);
  }
}

// Export singleton instance
export const speechCleaner = new SpeechCleaner();
