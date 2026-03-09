/**
 * Blood Pressure Parser Service
 * 
 * Extracts and validates blood pressure readings from natural speech.
 * Supports multiple formats:
 * - 120/80
 * - 120 over 80
 * - 120 by 80
 * - 120 80
 * 
 * Validates realistic BP ranges and handles edge cases.
 * 
 * @module BPParser
 */

export interface BPReading {
  systolic: number;
  diastolic: number;
  formatted: string;
  confidence: number;
  raw: string;
}

export interface BPResult {
  reading: BPReading | null;
  isValid: boolean;
  validationErrors: string[];
}

export class BPParser {
  // BP validation ranges
  private readonly ranges = {
    systolic: { min: 80, max: 200 },
    diastolic: { min: 40, max: 130 }
  };

  // BP keywords
  private readonly bpKeywords = [
    'bp', 'b p', 'b.p', 'b.p.', 'blood pressure', 'pressure',
    'raktchaap', 'raktchap', 'रक्तचाप', 'ब्लड प्रेशर', 'बीपी'
  ];

  // Separator keywords
  private readonly separators = ['over', 'by', 'slash', 'se', 'par'];

  /**
   * Parse blood pressure from text
   * @param text - Cleaned speech text
   * @returns BP parsing result
   */
  parse(text: string): BPResult {
    console.log('[BPParser] Parsing BP from:', text);
    
    const lowerText = text.toLowerCase();
    const validationErrors: string[] = [];
    
    // Try different extraction strategies
    const reading = 
      this.extractWithKeyword(lowerText) ||
      this.extractWithSeparator(lowerText) ||
      this.extractAdjacentNumbers(lowerText) ||
      this.extractSlashFormat(lowerText);
    
    if (!reading) {
      console.log('[BPParser] No BP reading found');
      return {
        reading: null,
        isValid: false,
        validationErrors: ['No blood pressure reading found']
      };
    }
    
    // Validate the reading
    const validation = this.validate(reading);
    
    if (!validation.isValid) {
      console.log('[BPParser] Invalid BP reading:', validation.errors);
      return {
        reading: null,
        isValid: false,
        validationErrors: validation.errors
      };
    }
    
    console.log('[BPParser] Valid BP reading:', reading.formatted);
    
    return {
      reading,
      isValid: true,
      validationErrors: []
    };
  }

  /**
   * Extract BP with keyword context
   * Example: "bp is 120 80", "blood pressure 130 over 90"
   */
  private extractWithKeyword(text: string): BPReading | null {
    for (const keyword of this.bpKeywords) {
      const keywordIndex = text.indexOf(keyword);
      if (keywordIndex !== -1) {
        const afterKeyword = text.substring(keywordIndex + keyword.length);
        
        // Try to extract numbers after keyword
        const patterns = [
          // "120/80"
          /(\d{2,3})\s*[\/\\]\s*(\d{2,3})/,
          // "120 over 80", "120 by 80"
          /(\d{2,3})\s+(?:over|by|se|par)\s+(\d{2,3})/,
          // "is 120 80", "hai 120 80"
          /(?:is|hai|tha|thi|the)?\s*(\d{2,3})\s+(\d{2,3})/,
        ];
        
        for (const pattern of patterns) {
          const match = afterKeyword.match(pattern);
          if (match) {
            const systolic = parseInt(match[1]);
            const diastolic = parseInt(match[2]);
            
            return {
              systolic,
              diastolic,
              formatted: `${systolic}/${diastolic}`,
              confidence: 0.95,
              raw: match[0]
            };
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Extract BP with separator words
   * Example: "120 over 80", "130 by 90"
   */
  private extractWithSeparator(text: string): BPReading | null {
    for (const separator of this.separators) {
      const pattern = new RegExp(`(\\d{2,3})\\s+${separator}\\s+(\\d{2,3})`, 'i');
      const match = text.match(pattern);
      
      if (match) {
        const systolic = parseInt(match[1]);
        const diastolic = parseInt(match[2]);
        
        return {
          systolic,
          diastolic,
          formatted: `${systolic}/${diastolic}`,
          confidence: 0.9,
          raw: match[0]
        };
      }
    }
    
    return null;
  }

  /**
   * Extract adjacent numbers that look like BP
   * Example: "120 80" (without separator)
   */
  private extractAdjacentNumbers(text: string): BPReading | null {
    // Look for two 2-3 digit numbers close together
    const pattern = /\b(\d{2,3})\s+(\d{2,3})\b/g;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const systolic = parseInt(match[1]);
      const diastolic = parseInt(match[2]);
      
      // Check if numbers are in realistic BP range
      if (this.isRealisticBP(systolic, diastolic)) {
        return {
          systolic,
          diastolic,
          formatted: `${systolic}/${diastolic}`,
          confidence: 0.75, // Lower confidence without separator
          raw: match[0]
        };
      }
    }
    
    return null;
  }

  /**
   * Extract slash format BP
   * Example: "120/80", "130\90"
   */
  private extractSlashFormat(text: string): BPReading | null {
    const pattern = /\b(\d{2,3})\s*[\/\\]\s*(\d{2,3})\b/;
    const match = text.match(pattern);
    
    if (match) {
      const systolic = parseInt(match[1]);
      const diastolic = parseInt(match[2]);
      
      return {
        systolic,
        diastolic,
        formatted: `${systolic}/${diastolic}`,
        confidence: 1.0, // Highest confidence for explicit format
        raw: match[0]
      };
    }
    
    return null;
  }

  /**
   * Quick check if numbers are in realistic BP range
   */
  private isRealisticBP(systolic: number, diastolic: number): boolean {
    return (
      systolic >= this.ranges.systolic.min &&
      systolic <= this.ranges.systolic.max &&
      diastolic >= this.ranges.diastolic.min &&
      diastolic <= this.ranges.diastolic.max &&
      systolic > diastolic // Systolic should be higher
    );
  }

  /**
   * Validate BP reading
   */
  private validate(reading: BPReading): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check systolic range
    if (reading.systolic < this.ranges.systolic.min) {
      errors.push(`Systolic too low: ${reading.systolic} (min: ${this.ranges.systolic.min})`);
    }
    if (reading.systolic > this.ranges.systolic.max) {
      errors.push(`Systolic too high: ${reading.systolic} (max: ${this.ranges.systolic.max})`);
    }
    
    // Check diastolic range
    if (reading.diastolic < this.ranges.diastolic.min) {
      errors.push(`Diastolic too low: ${reading.diastolic} (min: ${this.ranges.diastolic.min})`);
    }
    if (reading.diastolic > this.ranges.diastolic.max) {
      errors.push(`Diastolic too high: ${reading.diastolic} (max: ${this.ranges.diastolic.max})`);
    }
    
    // Check systolic > diastolic
    if (reading.systolic <= reading.diastolic) {
      errors.push(`Systolic (${reading.systolic}) must be greater than diastolic (${reading.diastolic})`);
    }
    
    // Check pulse pressure (difference should be reasonable)
    const pulsePressure = reading.systolic - reading.diastolic;
    if (pulsePressure < 20) {
      errors.push(`Pulse pressure too narrow: ${pulsePressure} (min: 20)`);
    }
    if (pulsePressure > 100) {
      errors.push(`Pulse pressure too wide: ${pulsePressure} (max: 100)`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Classify BP reading (normal, elevated, high, etc.)
   */
  classifyBP(reading: BPReading): string {
    const { systolic, diastolic } = reading;
    
    if (systolic < 120 && diastolic < 80) {
      return 'Normal';
    } else if (systolic >= 120 && systolic < 130 && diastolic < 80) {
      return 'Elevated';
    } else if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
      return 'High Blood Pressure (Stage 1)';
    } else if (systolic >= 140 || diastolic >= 90) {
      return 'High Blood Pressure (Stage 2)';
    } else if (systolic >= 180 || diastolic >= 120) {
      return 'Hypertensive Crisis';
    }
    
    return 'Unknown';
  }
}

// Export singleton instance
export const bpParser = new BPParser();
