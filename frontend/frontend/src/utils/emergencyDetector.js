// ULTRON High-Precision Emergency Distress Code Word Detector
// Evaluates transcripts for critical emergency triggers:
// "help me", "save me", "someone is attacking", "help", "sos", "call police", etc.

export function evaluateEmergencyCodeWords(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // Clean punctuation, normalize whitespace, and lowercase
  const normalized = rawText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return null;

  // 1. High-priority exact & multi-word phrase patterns
  const priorityPhrases = [
    // Attack variations
    { phrase: 'someone is attacking me', label: 'someone is attacking' },
    { phrase: 'someone is attacking', label: 'someone is attacking' },
    { phrase: 'somebody is attacking me', label: 'someone is attacking' },
    { phrase: 'somebody is attacking', label: 'someone is attacking' },
    { phrase: 'someone attack me', label: 'someone is attacking' },
    { phrase: 'someone attacking me', label: 'someone is attacking' },
    { phrase: 'someone attacking', label: 'someone is attacking' },
    { phrase: 'he is attacking me', label: 'someone is attacking' },
    { phrase: 'they are attacking me', label: 'someone is attacking' },
    { phrase: 'i am being attacked', label: 'someone is attacking' },
    { phrase: 'im being attacked', label: 'someone is attacking' },
    { phrase: 'i am under attack', label: 'someone is attacking' },
    { phrase: 'im under attack', label: 'someone is attacking' },
    { phrase: 'under attack', label: 'someone is attacking' },

    // Help variations
    { phrase: 'help me please', label: 'help' },
    { phrase: 'please help me', label: 'help' },
    { phrase: 'help me', label: 'help' },
    { phrase: 'helpme', label: 'help' },
    { phrase: 'somebody help me', label: 'help' },
    { phrase: 'someone help me', label: 'help' },
    { phrase: 'i need help', label: 'help' },
    { phrase: 'please help', label: 'help' },
    { phrase: 'ultron help me', label: 'help' },
    { phrase: 'ultron help', label: 'help' },
    { phrase: 'help', label: 'help' },

    // Save variations
    { phrase: 'save me please', label: 'save me' },
    { phrase: 'please save me', label: 'save me' },
    { phrase: 'save me', label: 'save me' },
    { phrase: 'save my life', label: 'save me' },
    { phrase: 'save us', label: 'save me' },

    // Danger / Stalking variations
    { phrase: 'someone is following me', label: 'someone is following me' },
    { phrase: 'somebody is following me', label: 'someone is following me' },
    { phrase: 'being followed', label: 'someone is following me' },
    { phrase: 'i am in danger', label: 'i am in danger' },
    { phrase: 'im in danger', label: 'i am in danger' },

    // Emergency / Police dispatch variations
    { phrase: 'call the police', label: 'call the police' },
    { phrase: 'call police', label: 'call the police' },
    { phrase: 'call 911', label: 'call the police' },
    { phrase: 'call 112', label: 'call the police' },
    { phrase: 'send emergency alert', label: 'emergency' },
    { phrase: 'send alert', label: 'emergency' },
    { phrase: 'emergency alert', label: 'emergency' },
    { phrase: 'emergency sos', label: 'sos' }
  ];

  for (const item of priorityPhrases) {
    if (normalized.includes(item.phrase)) {
      return { matched: true, codeWord: item.label, source: rawText };
    }
  }

  // 2. Standalone word boundaries for critical single code words
  if (/\bhelp\b/i.test(normalized)) {
    return { matched: true, codeWord: 'help', source: rawText };
  }

  if (/\bsave\b/i.test(normalized)) {
    return { matched: true, codeWord: 'save me', source: rawText };
  }

  if (/\b(attack|attacking|attacked)\b/i.test(normalized)) {
    return { matched: true, codeWord: 'someone is attacking', source: rawText };
  }

  if (/\bsos\b/i.test(normalized)) {
    return { matched: true, codeWord: 'sos', source: rawText };
  }

  if (/\bemergency\b/i.test(normalized)) {
    return { matched: true, codeWord: 'emergency', source: rawText };
  }

  if (/\bpolice\b/i.test(normalized)) {
    return { matched: true, codeWord: 'call the police', source: rawText };
  }

  if (/\bdanger\b/i.test(normalized)) {
    return { matched: true, codeWord: 'i am in danger', source: rawText };
  }

  return null;
}
