import { useState, useEffect } from 'react';

interface PatternSet {
  accountPatterns: string[];
  namePatterns: string[];
}

const DEFAULT_PATTERNS: PatternSet = {
  accountPatterns: [
    // Specific patterns for known formats
    'account\\s*(?:nbr|number|no)[:\\s]+(FBNWSTX\\d+)',
    'account\\s*(?:nbr|number|no)[:\\s]+(DNWSTX\\d+)',
    'account\\s*(?:nbr|number|no)[:\\s]+(WNWSTX\\d+)',
    'account\\s*(?:nbr|number|no)[:\\s]+(SMNWSTX\\d+)',
    'account\\s*(?:nbr|number|no)[:\\s]+(SENWSTX\\d+)',
    'account\\s*(?:nbr|number|no)[:\\s]+(SVNWSTX\\d+)',
    'account\\s*(?:nbr|number|no)[:\\s]+(PPNWSTX\\d+)',
    'account\\s*(?:nbr|number|no)[:\\s]+(OHNWSTX\\d+)',
    'account\\s*(?:nbr|number|no)[:\\s]+(SUNWSTX\\d+)',

    // Generic patterns for various account formats
    'account\\s*(?:nbr|number|no)[:\\s]+([A-Z]{2,}\\d+)',
    'account\\s*(?:nbr|number|no)[:\\s]+(\\d{6,})',
    'account\\s*(?:nbr|number|no)[:\\s]+([A-Z0-9]{6,})',

    // Alternative labels
    'acct\\s*(?:nbr|number|no)[:\\s]+([A-Z0-9]{6,})',
    'account[:\\s]+([A-Z0-9]{6,})',
    'acct[:\\s]+([A-Z0-9]{6,})',

    // More flexible patterns
    '(?:account|acct)\\s*#[:\\s]*([A-Z0-9]{6,})',
    'account\\s*id[:\\s]+([A-Z0-9]{6,})',
    'customer\\s*(?:account|acct)[:\\s]+([A-Z0-9]{6,})',

    // Very generic - any alphanumeric sequence that looks like an account
    '([A-Z]{2,}\\d{4,})',
    '(\\d{8,})',
    '([A-Z0-9]{8,})'
  ],
  namePatterns: [
    // Married couple patterns (priority - check first)
    "customer\\s*name[:\\s]+([A-Za-z]+\\s*&\\s*[A-Za-z]+\\s+[A-Za-z]+'?s?)", // Celia & Felipe Ramirez's
    'customer\\s*name[:\\s]+([A-Za-z]+\\s*&\\s*[A-Za-z]+\\s+[A-Za-z]+)', // John & Mary Smith
    "customer\\s*name[:\\s]+([A-Za-z]+\\s+&\\s+[A-Za-z]+\\s+[A-Za-z]+'?s?)", // Maria & Carlos Rodriguez's

    // Customer name patterns
    'customer\\s*name[:\\s]+([A-Z][a-z]+\\s+[A-Z][a-z]+)\\s*(?:Account)?',
    'customer\\s*name[:\\s]+([A-Z][a-z]+\\s+[A-Z][a-z]+\\s+[A-Z][a-z]+)\\s*(?:Account)?',
    'customer\\s*name[:\\s]+([A-Z][A-Z\\s]+)', // ALL CAPS names
    'customer\\s*name[:\\s]+([A-Za-z]+\\s+[A-Za-z]+(?:\\s+[A-Za-z]+)?)', // Mixed case
    "customer\\s*name[:\\s]+([A-Za-z\\s\\.\\-']+)", // Names with dots, hyphens, apostrophes

    // Alternative customer labels
    'customer[:\\s]+([A-Za-z]+\\s+[A-Za-z]+(?:\\s+[A-Za-z]+)?)',
    'client\\s*name[:\\s]+([A-Za-z]+\\s+[A-Za-z]+(?:\\s+[A-Za-z]+)?)',
    'client[:\\s]+([A-Za-z]+\\s+[A-Za-z]+(?:\\s+[A-Za-z]+)?)',

    // Name patterns
    'name[:\\s]+([A-Z][a-z]+\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)',
    'name[:\\s]+([A-Za-z]+\\s+[A-Za-z]+(?:\\s+[A-Za-z]+)?)',
    "name[:\\s]+([A-Za-z\\s\\.\\-']+)",

    // Account holder patterns
    'account\\s*holder[:\\s]+([A-Z][a-z]+\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)',
    'account\\s*holder[:\\s]+([A-Za-z]+\\s+[A-Za-z]+(?:\\s+[A-Za-z]+)?)',
    "account\\s*holder[:\\s]+([A-Za-z\\s\\.\\-']+)",

    // Bill to patterns
    'bill\\s*to[:\\s]+([A-Z][a-z]+\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)',
    'bill\\s*to[:\\s]+([A-Za-z]+\\s+[A-Za-z]+(?:\\s+[A-Za-z]+)?)',
    "bill\\s*to[:\\s]+([A-Za-z\\s\\.\\-']+)",

    // Service for patterns
    'service\\s*for[:\\s]+([A-Za-z]+\\s+[A-Za-z]+(?:\\s+[A-Za-z]+)?)',
    'statement\\s*for[:\\s]+([A-Za-z]+\\s+[A-Za-z]+(?:\\s+[A-Za-z]+)?)',

    // Address patterns (sometimes names appear in address blocks)
    'dear\\s+([A-Za-z]+\\s+[A-Za-z]+)',
    'mr\\.?\\s+([A-Za-z]+\\s+[A-Za-z]+)',
    'mrs\\.?\\s+([A-Za-z]+\\s+[A-Za-z]+)',
    'ms\\.?\\s+([A-Za-z]+\\s+[A-Za-z]+)',

    // Generic patterns for any name-like text (use with caution)
    '([A-Z][a-z]+\\s+[A-Z][a-z]+)(?=\\s|$)', // Two capitalized words
    '([A-Z][A-Z\\s]+)(?=\\s|$)' // ALL CAPS words
  ]
};

export function usePatterns() {
  const [patterns, setPatterns] = useState<PatternSet>(DEFAULT_PATTERNS);

  useEffect(() => {
    const stored = localStorage.getItem('pdf-splitter-patterns');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPatterns(parsed);
      } catch (error) {
        console.error('Failed to parse stored patterns:', error);
      }
    }
  }, []);

  const savePatterns = (newPatterns: PatternSet) => {
    setPatterns(newPatterns);
    localStorage.setItem('pdf-splitter-patterns', JSON.stringify(newPatterns));
  };

  const addAccountPattern = (pattern: string) => {
    const newPatterns = {
      ...patterns,
      accountPatterns: [...patterns.accountPatterns, pattern]
    };
    savePatterns(newPatterns);
  };

  const addNamePattern = (pattern: string) => {
    const newPatterns = {
      ...patterns,
      namePatterns: [...patterns.namePatterns, pattern]
    };
    savePatterns(newPatterns);
  };

  const removeAccountPattern = (index: number) => {
    const newPatterns = {
      ...patterns,
      accountPatterns: patterns.accountPatterns.filter((_, i) => i !== index)
    };
    savePatterns(newPatterns);
  };

  const removeNamePattern = (index: number) => {
    const newPatterns = {
      ...patterns,
      namePatterns: patterns.namePatterns.filter((_, i) => i !== index)
    };
    savePatterns(newPatterns);
  };

  const resetToDefaults = () => {
    savePatterns(DEFAULT_PATTERNS);
  };

  return {
    patterns,
    addAccountPattern,
    addNamePattern,
    removeAccountPattern,
    removeNamePattern,
    resetToDefaults
  };
}
