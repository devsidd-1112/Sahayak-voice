/**
 * Name Extractor Service
 * 
 * Extracts patient names from conversational speech.
 * Handles multiple patterns and languages.
 * 
 * @module NameExtractor
 */

export interface NameMatch {
  name: string;
  confidence: number;
  pattern: string;
  raw: string;
}

export class NameExtractor {
  // Common Indian surnames/titles
  private readonly surnames = [
    'devi', 'kumari', 'kumar', 'singh', 'sharma', 'verma', 'gupta',
    'patel', 'yadav', 'reddy', 'nair', 'iyer', 'bai', 'kaur'
  ];

  // Name indicator patterns
  private readonly patterns = [
    // "patient name is Priya", "name is Anjali"
    {
      regex: /(?:patient\s+)?name\s+(?:is|hai)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      confidence: 0.95,
      name: 'name_is'
    },
    // "visited Priya", "met Sunita", "saw Meera"
    {
      regex: /(?:visited|met|saw|gai|gayi|gaya|mili|mila)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      confidence: 0.9,
      name: 'visited'
    },
    // "patient Kavita", "patient is Pooja"
    {
      regex: /patient\s+(?:is\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      confidence: 0.9,
      name: 'patient'
    },
    // Hindi: "Priya ke ghar", "Sunita ki", "Meera ka"
    {
      regex: /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:ke ghar|ki|ka|ko|se)/i,
      confidence: 0.85,
      name: 'hindi_possessive'
    },
    // "Priya's house", "Anjali's place"
    {
      regex: /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'s\s+(?:house|place|home)/i,
      confidence: 0.85,
      name: 'possessive'
    }
  ];

  // Words to exclude (not names)
  private readonly excludeWords = [
    'today', 'yesterday', 'aaj', 'kal', 'the', 'this', 'that',
    'blood', 'pressure', 'baby', 'child', 'fever', 'cough',
    'patient', 'name', 'is', 'has', 'and', 'or', 'with'
  ];

  /**
   * Extract patient name from text
   * @param text - Cleaned speech text
   * @returns Name match or null
   */
  extract(text: string): NameMatch | null {
    console.log('[NameExtractor] Extracting name from:', text);
    
    // Try pattern-based extraction first
    for (const pattern of this.patterns) {
      const match = text.match(pattern.regex);
      if (match && match[1]) {
        const name = this.cleanName(match[1]);
        
        if (this.isValidName(name)) {
          console.log(`[NameExtractor] Found name with pattern '${pattern.name}':`, name);
          return {
            name: this.capitalizeName(name),
            confidence: pattern.confidence,
            pattern: pattern.name,
            raw: match[0]
          };
        }
      }
    }
    
    // Fallback: Look for capitalized words
    const capitalizedName = this.extractCapitalizedName(text);
    if (capitalizedName) {
      console.log('[NameExtractor] Found capitalized name:', capitalizedName);
      return {
        name: capitalizedName,
        confidence: 0.6, // Lower confidence for fallback
        pattern: 'capitalized',
        raw: capitalizedName
      };
    }
    
    console.log('[NameExtractor] No name found');
    return null;
  }

  /**
   * Extract capitalized words that might be names
   */
  private extractCapitalizedName(text: string): string | null {
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check if word is capitalized
      if (/^[A-Z][a-z]+$/.test(word)) {
        // Check if it's not an excluded word
        if (!this.excludeWords.includes(word.toLowerCase())) {
          // Check if next word is a surname
          if (i + 1 < words.length) {
            const nextWord = words[i + 1];
            if (this.surnames.includes(nextWord.toLowerCase())) {
              return `${word} ${nextWord}`;
            }
          }
          
          // Return single name
          return word;
        }
      }
    }
    
    return null;
  }

  /**
   * Clean extracted name
   */
  private cleanName(name: string): string {
    return name
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' '); // Normalize spaces
  }

  /**
   * Validate if extracted text is a valid name
   */
  private isValidName(name: string): boolean {
    // Must have at least 2 characters
    if (name.length < 2) return false;
    
    // Must not be an excluded word
    if (this.excludeWords.includes(name.toLowerCase())) return false;
    
    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(name)) return false;
    
    // Must not be all uppercase (likely acronym)
    if (name === name.toUpperCase()) return false;
    
    return true;
  }

  /**
   * Capitalize name properly
   */
  private capitalizeName(name: string): string {
    return name
      .split(/\s+/)
      .map(word => {
        // Keep surnames in lowercase if they're common
        if (this.surnames.includes(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  /**
   * Extract multiple names if present
   */
  extractMultiple(text: string): NameMatch[] {
    const names: NameMatch[] = [];
    
    for (const pattern of this.patterns) {
      const regex = new RegExp(pattern.regex.source, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        if (match[1]) {
          const name = this.cleanName(match[1]);
          
          if (this.isValidName(name)) {
            names.push({
              name: this.capitalizeName(name),
              confidence: pattern.confidence,
              pattern: pattern.name,
              raw: match[0]
            });
          }
        }
      }
    }
    
    // Deduplicate names
    const uniqueNames = new Map<string, NameMatch>();
    for (const nameMatch of names) {
      const key = nameMatch.name.toLowerCase();
      const existing = uniqueNames.get(key);
      
      if (!existing || nameMatch.confidence > existing.confidence) {
        uniqueNames.set(key, nameMatch);
      }
    }
    
    return Array.from(uniqueNames.values());
  }
}

// Export singleton instance
export const nameExtractor = new NameExtractor();
