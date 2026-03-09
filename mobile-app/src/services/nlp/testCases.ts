/**
 * NLP Pipeline Test Cases
 * 
 * Comprehensive test cases for validating the NLP pipeline.
 * Target accuracy: 90-95%
 */

export interface TestCase {
  id: string;
  input: string;
  language: 'hi' | 'en';
  expected: {
    patientName: string | null;
    bloodPressure: string | null;
    childSymptom: string | null;
  };
  description: string;
}

export const testCases: TestCase[] = [
  // English test cases
  {
    id: 'EN-001',
    input: 'patient name is Priya blood pressure is 120 over 80 baby has fever',
    language: 'en',
    expected: {
      patientName: 'Priya',
      bloodPressure: '120/80',
      childSymptom: 'fever'
    },
    description: 'Complete visit with all entities'
  },
  {
    id: 'EN-002',
    input: 'visited Sunita today BP 110 80 child has cough',
    language: 'en',
    expected: {
      patientName: 'Sunita',
      bloodPressure: '110/80',
      childSymptom: 'cough'
    },
    description: 'Natural speech pattern'
  },
  {
    id: 'EN-003',
    input: 'met Anjali pressure 130 by 90 baby fever and cough',
    language: 'en',
    expected: {
      patientName: 'Anjali',
      bloodPressure: '130/90',
      childSymptom: 'fever, cough'
    },
    description: 'Multiple symptoms'
  },
  {
    id: 'EN-004',
    input: 'saw Meera today her BP was 125/85 child has diarrhea',
    language: 'en',
    expected: {
      patientName: 'Meera',
      bloodPressure: '125/85',
      childSymptom: 'diarrhea'
    },
    description: 'Slash format BP'
  },
  {
    id: 'EN-005',
    input: 'patient Kavita blood pressure 140 90 baby vomiting',
    language: 'en',
    expected: {
      patientName: 'Kavita',
      bloodPressure: '140/90',
      childSymptom: 'vomiting'
    },
    description: 'Adjacent numbers BP'
  },

  // Hindi/Hinglish test cases
  {
    id: 'HI-001',
    input: 'aaj main priya ke ghar gayi uska bp 120 by 80 tha bacche ko bukhar hai',
    language: 'hi',
    expected: {
      patientName: 'Priya',
      bloodPressure: '120/80',
      childSymptom: 'fever'
    },
    description: 'Complete Hindi sentence'
  },
  {
    id: 'HI-002',
    input: 'sunita se mili bp 115 75 bachche ko khansi hai',
    language: 'hi',
    expected: {
      patientName: 'Sunita',
      bloodPressure: '115/75',
      childSymptom: 'cough'
    },
    description: 'Hinglish mixed'
  },
  {
    id: 'HI-003',
    input: 'anjali ka bp 130 90 tha baby ko bukhar aur khansi hai',
    language: 'hi',
    expected: {
      patientName: 'Anjali',
      bloodPressure: '130/90',
      childSymptom: 'fever, cough'
    },
    description: 'Multiple symptoms in Hindi'
  },
  {
    id: 'HI-004',
    input: 'meera ke ghar gayi pressure 125 over 85 baccha ulti kar raha hai',
    language: 'hi',
    expected: {
      patientName: 'Meera',
      bloodPressure: '125/85',
      childSymptom: 'vomiting'
    },
    description: 'Mixed Hindi-English'
  },

  // Edge cases
  {
    id: 'EDGE-001',
    input: 'umm haan aaj priya ke ghar gayi achha uska bp tha 120 80 aur baby ko fever hai',
    language: 'hi',
    expected: {
      patientName: 'Priya',
      bloodPressure: '120/80',
      childSymptom: 'fever'
    },
    description: 'With filler words'
  },
  {
    id: 'EDGE-002',
    input: 'visited Pooja Devi blood pressure 135 over 88 child has cold and weakness',
    language: 'en',
    expected: {
      patientName: 'Pooja Devi',
      bloodPressure: '135/88',
      childSymptom: 'cold, weakness'
    },
    description: 'Full name with surname'
  },
  {
    id: 'EDGE-003',
    input: 'patient name Rekha Kumari BP is 118 78 baby has stomach ache',
    language: 'en',
    expected: {
      patientName: 'Rekha Kumari',
      bloodPressure: '118/78',
      childSymptom: 'stomach ache'
    },
    description: 'Formal name with title'
  },
  {
    id: 'EDGE-004',
    input: 'Priya 120/80 fever',
    language: 'en',
    expected: {
      patientName: 'Priya',
      bloodPressure: '120/80',
      childSymptom: 'fever'
    },
    description: 'Minimal speech'
  },
  {
    id: 'EDGE-005',
    input: 'name is Sunita pressure 110 by 70 baby has fever cough and cold',
    language: 'en',
    expected: {
      patientName: 'Sunita',
      bloodPressure: '110/70',
      childSymptom: 'fever, cough, cold'
    },
    description: 'Three symptoms'
  }
];

/**
 * Run test cases and calculate accuracy
 */
export function runTests(): { passed: number; failed: number; accuracy: number } {
  let passed = 0;
  let failed = 0;

  console.log('========================================');
  console.log('NLP PIPELINE TEST SUITE');
  console.log('========================================\n');

  for (const testCase of testCases) {
    console.log(`Test ${testCase.id}: ${testCase.description}`);
    console.log(`Input: "${testCase.input}"`);
    
    // Note: Actual testing would require importing visitParser
    // This is a template for manual testing
    
    console.log(`Expected:`, testCase.expected);
    console.log('---');
  }

  const accuracy = (passed / (passed + failed)) * 100;

  console.log('\n========================================');
  console.log('TEST RESULTS');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Accuracy: ${accuracy.toFixed(1)}%`);
  console.log('========================================');

  return { passed, failed, accuracy };
}
