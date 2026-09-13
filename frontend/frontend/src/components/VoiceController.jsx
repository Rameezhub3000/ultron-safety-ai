import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Mic, MicOff, ShieldAlert, CheckCircle, Info, X, Volume2, Square, Lock, AlertTriangle, Radio } from 'lucide-react';
import { speakUltron, isUltronSpeaking, stopUltronSpeech, initVoices, getAvailableMaleVoices, setUltronVoice } from '../utils/speechService';
import { isDeviceOnline, queueOfflineAlert, getCachedContacts } from '../utils/offlineStorage';
import { startAudioAnalysis, stopAudioAnalysis, isAudioAnalyzerActive } from '../utils/audioAnalyzer';
import { evaluateEmergencyCodeWords } from '../utils/emergencyDetector';

export default function VoiceController() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [unsupportedBrowser, setUnsupportedBrowser] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [maleVoices, setMaleVoices] = useState([]);
  const [currentVoiceName, setCurrentVoiceName] = useState('');
  const [micVolume, setMicVolume] = useState(0);

  // References to maintain persistent state across lifecycle turns
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(isListening);
  const isRecognitionActiveRef = useRef(false);
  const isStartingRef = useRef(false);
  const isTriggeringSosRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const lastSpeechEndTimeRef = useRef(0);

  // Synchronize isListening ref & broadcast
  useEffect(() => {
    isListeningRef.current = isListening;
    window.dispatchEvent(new CustomEvent('ultron-voice-state', {
      detail: { 
        isListening, 
        isRecognitionActive: isRecognitionActiveRef.current,
        permissionError,
        networkError,
        micVolume
      }
    }));
  }, [isListening, permissionError, networkError, micVolume]);

  // Pre-load natural speech voices on mount
  useEffect(() => {
    initVoices((selected, available) => {
      setMaleVoices(available || []);
      setCurrentVoiceName(selected?.name || '');
    });

    const handleSpeechStart = () => {
      setIsSpeaking(true);
      setTranscript('');
    };
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      lastSpeechEndTimeRef.current = Date.now();
    };

    window.addEventListener('ultron-speech-start', handleSpeechStart);
    window.addEventListener('ultron-speech-end', handleSpeechEnd);

    return () => {
      window.removeEventListener('ultron-speech-start', handleSpeechStart);
      window.removeEventListener('ultron-speech-end', handleSpeechEnd);
    };
  }, []);

  // Trigger Emergency SOS Procedure
  const triggerVoiceSOS = useCallback(async (codeWord) => {
    if (isTriggeringSosRef.current) return;
    isTriggeringSosRef.current = true;

    console.log(`[ULTRON VOICE] 🚨 EMERGENCY CODE WORD TRIGGERED: "${codeWord}"`);

    // Immediately stop any TTS playback
    stopUltronSpeech();

    // Notify user visually and audibly
    setActiveAlert({
      codeWord,
      time: new Date().toLocaleTimeString(),
    });

    // 1. Check Offline Mode
    const online = isDeviceOnline();

    if (!online) {
      console.log(`[ULTRON VOICE] ⚠️ OFFLINE MODE: Triggering local emergency protocols.`);
      speakUltron("Code word detected, activating Ultron.");

      queueOfflineAlert({
        type: `VOICE_SOS [${codeWord.toUpperCase()}]`,
        location: null,
        timestamp: new Date().toISOString()
      });

      // Immediate local cellular dial
      const cached = getCachedContacts();
      const primaryPhone = cached.length > 0 ? cached[0].phone : '911';
      const a = document.createElement('a');
      a.href = `tel:${primaryPhone}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        isTriggeringSosRef.current = false;
      }, 8000);
      return;
    }

    // 2. Online Mode: Real-time Live Location, Nodemailer Emails & Twilio Calls
    speakUltron("Code word detected, activating Ultron.");

    const sendAlert = async (locationCoords) => {
      try {
        await axios.post('http://localhost:5000/api/alerts', {
          type: `VOICE_SOS [${codeWord.toUpperCase()}]`,
          location: locationCoords
        });
        console.log(`[ULTRON VOICE] ✅ SOS alert posted. Backend is dialing contacts via Twilio.`);
      } catch (err) {
        console.error("[ULTRON VOICE] SOS Dispatch API error:", err);
        queueOfflineAlert({
          type: `VOICE_SOS [${codeWord.toUpperCase()}]`,
          location: locationCoords
        });
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendAlert({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          sendAlert(null);
        },
        { timeout: 3000, enableHighAccuracy: true }
      );
    } else {
      sendAlert(null);
    }

    // Cooldown release after 8 seconds
    setTimeout(() => {
      isTriggeringSosRef.current = false;
    }, 8000);
  }, []);

  // AI command handler for non-emergency inquiries
  const handleAICommand = useCallback(async (command) => {
    setIsProcessing(true);
    try {
      const res = await axios.post('http://localhost:5000/api/ai/chat', { message: command });
      speakUltron(res.data.reply || "I am active and monitoring your safety.");
    } catch (error) {
      console.error(error);
      speakUltron("Sorry, I could not connect to the safety server.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Safe Speech Recognition starter
  const startSpeechEngine = useCallback(() => {
    if (!isListeningRef.current) return;
    if (isRecognitionActiveRef.current || isStartingRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUnsupportedBrowser(true);
      return;
    }

    isStartingRef.current = true;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 3;

      rec.onstart = () => {
        isRecognitionActiveRef.current = true;
        isStartingRef.current = false;
        setPermissionError(false);
        setNetworkError(false);
        console.log("[ULTRON VOICE] 🎙️ Speech recognition engine live.");
      };

      rec.onresult = (event) => {
        // Echo & Feedback Immunity: Discard all mic audio while Ultron is speaking or within 1200ms after speaking
        if (isUltronSpeaking() || (Date.now() - lastSpeechEndTimeRef.current < 1200)) {
          return;
        }

        let currentFinal = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += ' ' + item;
          } else {
            currentInterim += ' ' + item;
          }
        }

        // Rolling transcript across recent segments to detect multi-word phrases across turns
        let rollingRecent = '';
        const startChunk = Math.max(0, event.results.length - 4);
        for (let i = startChunk; i < event.results.length; i++) {
          rollingRecent += ' ' + event.results[i][0].transcript;
        }
        rollingRecent = rollingRecent.trim();

        const activeText = (currentFinal || currentInterim || rollingRecent).trim();
        if (!activeText) return;

        setTranscript(activeText);
        window.dispatchEvent(new CustomEvent('ultron-voice-transcript', { detail: { transcript: activeText } }));

        // 1. Check for Emergency Code Words IMMEDIATELY across activeText, rollingRecent, and alternatives
        let sosMatch = evaluateEmergencyCodeWords(activeText) || evaluateEmergencyCodeWords(rollingRecent);

        if (!sosMatch) {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            for (let j = 0; j < event.results[i].length; j++) {
              const alt = evaluateEmergencyCodeWords(event.results[i][j].transcript);
              if (alt && alt.matched) {
                sosMatch = alt;
                break;
              }
            }
            if (sosMatch) break;
          }
        }

        if (sosMatch && sosMatch.matched) {
          triggerVoiceSOS(sosMatch.codeWord);
          return;
        }

        // 2. AI Wake Word / Assistant Command Detection
        const lowerText = activeText.toLowerCase();
        if (lowerText.includes('ultron')) {
          if (currentFinal) {
            const commandIndex = lowerText.indexOf('ultron') + 6;
            const command = lowerText.substring(commandIndex).replace(/^[,\s.:?!]+/, '').trim();
            if (command.length > 0) {
              handleAICommand(command);
            } else {
              speakUltron("Yes, I am online and listening. How can I assist you?");
            }
          }
        }
      };

      rec.onerror = (event) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          console.warn("[ULTRON VOICE] Speech error:", event.error);
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError(true);
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === 'network') {
          setNetworkError(true);
        }
      };

      rec.onend = () => {
        isRecognitionActiveRef.current = false;
        isStartingRef.current = false;

        // Auto-restart continuously while listening mode is enabled
        if (isListeningRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              startSpeechEngine();
            }
          }, 350);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      isStartingRef.current = false;
      isRecognitionActiveRef.current = false;
      console.warn("[ULTRON VOICE] Start failed:", err);

      if (isListeningRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current) startSpeechEngine();
        }, 1000);
      }
    }
  }, [triggerVoiceSOS, handleAICommand]);

  // Main activate function called on user interaction / gesture
  const activateVoiceGuard = useCallback(async (isUserGesture = true) => {
    setIsListening(true);
    isListeningRef.current = true;
    setPermissionError(false);
    setNetworkError(false);

    // 1. Start real-time Web Audio API decibel & frequency analyzer (100% offline & local)
    try {
      const audioStarted = await startAudioAnalysis((vol) => {
        setMicVolume(vol);
      });

      if (!audioStarted && isUserGesture) {
        setPermissionError(true);
        setIsListening(false);
        isListeningRef.current = false;
        return;
      }
    } catch (err) {
      console.warn("[AUDIO ANALYZER] Init notice:", err);
    }

    // 2. Start Speech Recognition
    startSpeechEngine();

    // 3. Spoken audio confirmation only if initiated by user interaction
    if (isUserGesture) {
      speakUltron("Ultron voice assistant is active.");
    }
  }, [startSpeechEngine]);

  // Mute / stop voice guard
  const deactivateVoiceGuard = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    clearTimeout(restartTimeoutRef.current);
    stopAudioAnalysis();
    setMicVolume(0);

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    stopUltronSpeech();
  }, []);

  const toggleListen = useCallback(() => {
    if (isListening) {
      deactivateVoiceGuard();
    } else {
      activateVoiceGuard(true);
    }
  }, [isListening, activateVoiceGuard, deactivateVoiceGuard]);

  // Check if browser already granted mic permission on startup
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' }).then(result => {
        if (result.state === 'granted') {
          // Safe to start speech engine silently without un-gestured TTS
          activateVoiceGuard(false);
        } else if (result.state === 'denied') {
          setPermissionError(true);
        }
      }).catch(() => {});
    }

    // Listen to custom simulated phrase events (for Dashboard test chips)
    const handleSimulatedPhrase = (e) => {
      if (e.detail?.phrase) {
        setTranscript(e.detail.phrase);
        window.dispatchEvent(new CustomEvent('ultron-voice-transcript', { detail: { transcript: e.detail.phrase } }));

        const sosMatch = evaluateEmergencyCodeWords(e.detail.phrase);
        if (sosMatch && sosMatch.matched) {
          triggerVoiceSOS(sosMatch.codeWord);
        } else if (e.detail.phrase.toLowerCase().includes('ultron')) {
          speakUltron("Yes, I am listening. All safety protocols are active.");
        }
      }
    };

    const handleExplicitActivate = () => activateVoiceGuard(true);

    window.addEventListener('toggle-voice', toggleListen);
    window.addEventListener('activate-voice', handleExplicitActivate);
    window.addEventListener('simulate-voice-phrase', handleSimulatedPhrase);

    return () => {
      window.removeEventListener('toggle-voice', toggleListen);
      window.removeEventListener('activate-voice', handleExplicitActivate);
      window.removeEventListener('simulate-voice-phrase', handleSimulatedPhrase);
      clearTimeout(restartTimeoutRef.current);
      stopAudioAnalysis();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [activateVoiceGuard, toggleListen, triggerVoiceSOS]);

  const handleTestVoice = () => {
    speakUltron("ULTRON voice engine is online and calibrated. I am speaking clearly and ready to assist you.");
  };

  return (
    <>
      {/* Unsupported Browser Alert */}
      {unsupportedBrowser && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#081326',
          border: '1px solid rgba(255, 170, 0, 0.6)',
          color: '#ffaa00',
          padding: '12px 24px',
          borderRadius: '12px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          fontSize: '13px'
        }}>
          <AlertTriangle size={20} color="#ffaa00" />
          <span>Speech Recognition requires <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>. Please use Chrome/Edge for voice activation.</span>
        </div>
      )}

      {/* SOS Notification Modal / Banner when Code Word is Triggered */}
      {activeAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)',
          color: '#ffffff',
          border: '2px solid rgba(255, 255, 255, 0.6)',
          padding: '16px 28px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 210, 255, 0.8), inset 0 2px 8px rgba(255, 255, 255, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          animation: 'pulseRing 1.5s infinite',
          maxWidth: '90%'
        }}>
          <ShieldAlert size={36} color="#ffffff" />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.5px' }}>
              🚨 EMERGENCY SOS DISPATCHED
            </div>
            <div style={{ fontSize: '13px', opacity: 0.95, marginTop: '2px' }}>
              Code Word Detected: <strong>"{activeAlert.codeWord}"</strong> at {activeAlert.time}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              Emergency contacts notified & GPS location shared.
            </div>
          </div>
          <button 
            onClick={() => setActiveAlert(null)}
            style={{
              background: 'rgba(255,255,255,0.25)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginLeft: '12px',
              padding: 0
            }}
          >
            <X size={18} color="#ffffff" />
          </button>
        </div>
      )}

      {/* Code Words Cheat Sheet & Voice Settings Modal */}
      {showCheatSheet && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '25px',
          backgroundColor: '#081326',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '16px',
          padding: '20px',
          width: '340px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.7), 0 0 25px rgba(0, 210, 255, 0.15)',
          zIndex: 1001,
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, color: '#00d2ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> Active Code Words
            </h4>
            <button 
              onClick={() => setShowCheatSheet(false)}
              style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 10px 0' }}>
            Say any of these phrases clearly into your microphone at any time:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['help', 'save me', 'someone is attacking', 'under attack', 'call police', 'save us', 'danger', 'sos'].map(w => (
              <span key={w} style={{
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#e0f2fe',
                fontWeight: '500'
              }}>
                "{w}"
              </span>
            ))}
          </div>

          {/* Male Voice Selector & Test Controls */}
          <div style={{ marginTop: '16px', borderTop: '1px solid rgba(56, 189, 248, 0.15)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>AI Persona:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleTestVoice}
                  style={{
                    background: 'rgba(14, 165, 233, 0.2)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    color: '#38bdf8',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                >
                  <Volume2 size={13} /> Test Voice
                </button>
                {isSpeaking && (
                  <button
                    onClick={stopUltronSpeech}
                    title="Stop speaking"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Square size={11} fill="white" />
                  </button>
                )}
              </div>
            </div>

            {maleVoices.length > 0 && (
              <select
                value={currentVoiceName}
                onChange={(e) => {
                  setUltronVoice(e.target.value);
                  setCurrentVoiceName(e.target.value);
                }}
                style={{
                  width: '100%',
                  background: 'rgba(6, 14, 30, 0.7)',
                  color: '#ffffff',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  marginBottom: '10px'
                }}
              >
                {maleVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    🎙️ {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* On-Device Privacy Guarantee Badge */}
          <div style={{
            marginTop: '8px',
            background: 'rgba(0, 210, 255, 0.08)',
            border: '1px solid rgba(0, 210, 255, 0.25)',
            borderRadius: '8px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Lock size={14} color="#00d2ff" />
            <span style={{ fontSize: '11px', color: '#38bdf8', lineHeight: '1.3' }}>
              <strong>100% On-Device Privacy:</strong> Voice processing is strictly local. Room audio is never uploaded or saved.
            </span>
          </div>

          <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8' }}>
            💡 To ask questions, say <em>"Ultron [question]"</em>.
          </div>
        </div>
      )}

      {/* Floating Voice Controller Dock */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(8, 19, 41, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '8px 14px 8px 10px',
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: isListening ? '0 6px 28px rgba(0, 210, 255, 0.45)' : '0 4px 20px rgba(0,0,0,0.6)',
        border: isSpeaking ? '1px solid #00e676' : isListening ? '1px solid rgba(0, 210, 255, 0.6)' : '1px solid rgba(56, 189, 248, 0.2)',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}>
        <button 
          onClick={toggleListen}
          className={isListening && !permissionError ? 'listening-mic' : ''}
          title={permissionError ? 'Microphone Blocked (Click to Grant Access)' : isListening ? 'Voice Guard Active (Click to mute)' : 'Microphone Muted (Click to activate)'}
          style={{
            background: permissionError 
              ? 'rgba(255, 170, 0, 0.2)' 
              : isListening 
                ? 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)' 
                : 'rgba(255,255,255,0.08)',
            border: permissionError ? '1px solid #ffaa00' : isListening ? 'none' : '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
            boxShadow: isListening && !permissionError ? '0 0 20px rgba(0, 210, 255, 0.7)' : 'none',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
        >
          {permissionError ? <AlertTriangle size={22} color="#ffaa00" /> : isListening ? <Mic size={22} color="white" /> : <MicOff size={22} color="rgba(255,255,255,0.5)" />}
        </button>

        {/* Live Audio Telemetry Preview & Status */}
        <div style={{ marginLeft: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: permissionError ? '#ffaa00' : isSpeaking ? '#00e676' : isListening ? '#00d2ff' : '#888',
              boxShadow: isSpeaking ? '0 0 10px #00e676' : isListening && !permissionError ? '0 0 10px #00d2ff' : 'none',
              animation: isSpeaking || (isListening && micVolume > 15) ? 'pulseRing 1s infinite' : 'none'
            }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: isSpeaking ? '#00e676' : isListening ? '#ffffff' : '#888', letterSpacing: '0.3px' }}>
              {permissionError 
                ? 'Mic Blocked (Click to Allow)' 
                : networkError
                  ? 'Local Guard (Net Error)'
                  : isSpeaking 
                    ? 'ULTRON Speaking...' 
                    : isListening 
                      ? (isProcessing ? 'Thinking...' : 'Voice Guard: Active') 
                      : 'Voice Muted (Click Mic)'}
            </span>
          </div>

          <div style={{
            maxWidth: '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '11px',
            color: isListening ? 'rgba(226, 232, 240, 0.85)' : '#666',
            marginTop: '2px',
            fontStyle: transcript ? 'italic' : 'normal'
          }}>
            {permissionError 
              ? 'Click mic icon to grant access'
              : isSpeaking
                ? 'Voice output active'
                : transcript 
                  ? `"${transcript}"` 
                  : isListening 
                    ? (micVolume > 10 ? `Hearing audio (${micVolume}%)...` : 'Listening for code words...') 
                    : 'Click mic to activate'}
          </div>
        </div>

        {/* Info button to open supported code words */}
        <button
          onClick={() => setShowCheatSheet(prev => !prev)}
          title="View Supported Code Words & Voice Settings"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '6px',
            marginLeft: '8px',
            cursor: 'pointer',
            color: showCheatSheet ? '#00d2ff' : 'rgba(255,255,255,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Info size={16} />
        </button>
      </div>
    </>
  );
}
