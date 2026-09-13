// ULTRON High-Definition Voice Engine & Speech Synthesis Service
// Calibrated for Authoritative Male AI Voice & Privacy-Preserving Audio Pipeline

let selectedVoice = null;
let voicesLoaded = false;
let isSpeaking = false;
let keepAliveTimer = null;
let availableMaleVoices = [];

// Female voice name blocklist to guarantee a masculine voice persona
const FEMALE_VOICE_MARKERS = [
  'zira', 'jenny', 'aria', 'hazel', 'susan', 'catherine',
  'female', 'samantha', 'victoria', 'karen', 'fiona', 'moira', 'tessa'
];

const MALE_VOICE_MARKERS = [
  'david', 'mark', 'ryan', 'guy', 'christopher', 'george',
  'james', 'male', 'matthew', 'daniel', 'oliver', 'richard', 'brian'
];

function isFemaleVoice(name) {
  const lower = name.toLowerCase();
  return FEMALE_VOICE_MARKERS.some(marker => lower.includes(marker));
}

function isMaleVoice(name) {
  const lower = name.toLowerCase();
  return MALE_VOICE_MARKERS.some(marker => lower.includes(marker));
}

// Clean text for speech synthesis so it sounds natural and avoids reading symbols
export function sanitizeForSpeech(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    // Remove markdown links: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove emojis and special symbols
    .replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
    // Remove markdown formatting: bold, italics, code
    .replace(/[*_#`~>]/g, ' ')
    // Expand common acronyms for clearer pronunciation
    .replace(/\bSOS\b/g, 'S O S')
    .replace(/\bGPS\b/g, 'G P S')
    .replace(/\bAI\b/g, 'A I')
    // Replace hyphens and multiple spaces with natural pause
    .replace(/[-–—]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Load and select the best available natural MALE voice
export function initVoices(callback) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    voicesLoaded = true;

    // Filter all English voices that are male or non-female
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    availableMaleVoices = englishVoices.filter(v => isMaleVoice(v.name) || !isFemaleVoice(v.name));

    // Preference hierarchy for deep, authoritative, natural MALE voices:
    // 1. Natural / Neural Male English voices (Edge / Windows 11)
    const naturalMaleVoice = availableMaleVoices.find(v => 
      (v.name.includes('Natural') || v.name.includes('Online')) && 
      (v.name.includes('Ryan') || v.name.includes('Guy') || v.name.includes('Christopher') || isMaleVoice(v.name))
    );

    // 2. Google High Quality US/UK Male voices
    const googleMaleVoice = availableMaleVoices.find(v => 
      v.name.includes('Google UK English Male') || 
      (v.name.includes('Google') && isMaleVoice(v.name))
    );

    // 3. Classic authoritative desktop male voice (Microsoft David - deep, clear, commanding)
    const desktopDavidVoice = availableMaleVoices.find(v => v.name.includes('David'));

    // 4. Other male-tagged desktop voices
    const otherMaleVoice = availableMaleVoices.find(v => isMaleVoice(v.name));

    // 5. Any non-female English voice fallback
    const nonFemaleFallback = availableMaleVoices[0] || englishVoices.find(v => !isFemaleVoice(v.name)) || voices[0];

    // Priority assignment
    selectedVoice = naturalMaleVoice || googleMaleVoice || desktopDavidVoice || otherMaleVoice || nonFemaleFallback;

    console.log(`[ULTRON VOICE ENGINE] Selected Voice: "${selectedVoice?.name}" (${selectedVoice?.lang})`);

    if (callback) callback(selectedVoice, availableMaleVoices);
  };

  loadVoices();

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

// Get the currently selected voice
export function getSelectedVoice() {
  if (!selectedVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    initVoices();
  }
  return selectedVoice;
}

// Get list of discovered male voices for user selection
export function getAvailableMaleVoices() {
  return availableMaleVoices;
}

// Manually select a voice from options
export function setUltronVoice(voiceName) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.name === voiceName);
  if (match) {
    selectedVoice = match;
    console.log('[ULTRON VOICE ENGINE] Manually switched voice to:', match.name);
  }
}

let speakingTimeout = null;

// Check if ULTRON is currently talking
export function isUltronSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
    return true;
  }
  return isSpeaking;
}

// Core speak function calibrated for commanding male persona
export function speakUltron(rawText, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onComplete) options.onComplete();
    return;
  }

  const cleanText = sanitizeForSpeech(rawText);
  if (!cleanText) {
    if (options.onComplete) options.onComplete();
    return;
  }

  // Cancel any lingering queued speech
  window.speechSynthesis.cancel();
  clearInterval(keepAliveTimer);
  clearTimeout(speakingTimeout);

  // Chrome bug fix: periodic resume to prevent long speech freeze
  keepAliveTimer = setInterval(() => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.resume();
    } else {
      clearInterval(keepAliveTimer);
    }
  }, 4000);

  isSpeaking = true;
  window.dispatchEvent(new CustomEvent('ultron-speech-start', { detail: { text: cleanText } }));

  // Safety fallback: if speech takes > 25 seconds or gets stuck, force unlock listening
  speakingTimeout = setTimeout(() => {
    if (isSpeaking) {
      isSpeaking = false;
      window.dispatchEvent(new CustomEvent('ultron-speech-end'));
    }
  }, 25000);

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Apply voice
  if (!selectedVoice) {
    initVoices();
  }
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Pitch tuned to 0.90 for a deeper, masculine, calm and authoritative tone
  utterance.pitch = options.pitch !== undefined ? options.pitch : 0.90;
  // Rate tuned to 0.96 for clear, tactical pacing
  utterance.rate = options.rate !== undefined ? options.rate : 0.96;
  utterance.volume = options.volume || 1.0;

  utterance.onend = () => {
    clearInterval(keepAliveTimer);
    clearTimeout(speakingTimeout);
    // 800ms silence buffer to ensure mic doesn't pick up trailing room reverb
    setTimeout(() => {
      isSpeaking = false;
      window.dispatchEvent(new CustomEvent('ultron-speech-end'));
      if (options.onComplete) options.onComplete();
    }, 800);
  };

  utterance.onerror = (err) => {
    clearInterval(keepAliveTimer);
    clearTimeout(speakingTimeout);
    isSpeaking = false;
    window.dispatchEvent(new CustomEvent('ultron-speech-end'));
    console.warn("Speech synthesis error:", err);
    if (options.onError) options.onError(err);
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    clearInterval(keepAliveTimer);
    clearTimeout(speakingTimeout);
    isSpeaking = false;
    window.dispatchEvent(new CustomEvent('ultron-speech-end'));
    console.error("Failed to execute speak:", err);
  }
}

// Stop speech immediately
export function stopUltronSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    clearInterval(keepAliveTimer);
    clearTimeout(speakingTimeout);
    window.speechSynthesis.cancel();
    isSpeaking = false;
    window.dispatchEvent(new CustomEvent('ultron-speech-end'));
  }
}
