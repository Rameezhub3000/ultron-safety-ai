import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, MicOff, AlertTriangle, CheckCircle2, Volume2, ShieldAlert, Sparkles, Activity, Radio } from 'lucide-react';
import { speakUltron } from '../utils/speechService';

export default function Dashboard() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('');
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [frequencies, setFrequencies] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true }
      );
    }

    // Listen to live voice telemetry from VoiceController
    const handleVoiceState = (e) => {
      if (e.detail) {
        if (typeof e.detail.isListening === 'boolean') {
          setVoiceListening(e.detail.isListening);
        }
        if (typeof e.detail.permissionError === 'boolean') {
          setPermissionBlocked(e.detail.permissionError);
        }
        if (typeof e.detail.networkError === 'boolean') {
          setNetworkError(e.detail.networkError);
        }
      }
    };

    const handleVoiceTranscript = (e) => {
      if (e.detail?.transcript) {
        setVoiceTranscript(e.detail.transcript);
        setTimeout(() => setVoiceTranscript(''), 6000);
      }
    };

    const handleMicLevel = (e) => {
      if (e.detail) {
        setMicVolume(e.detail.volume || 0);
        if (e.detail.frequencies) {
          setFrequencies(e.detail.frequencies);
        }
      }
    };

    window.addEventListener('ultron-voice-state', handleVoiceState);
    window.addEventListener('ultron-voice-transcript', handleVoiceTranscript);
    window.addEventListener('ultron-mic-level', handleMicLevel);

    return () => {
      window.removeEventListener('ultron-voice-state', handleVoiceState);
      window.removeEventListener('ultron-voice-transcript', handleVoiceTranscript);
      window.removeEventListener('ultron-mic-level', handleMicLevel);
    };
  }, []);

  const triggerSOS = async () => {
    setStatus('Triggering SOS...');
    try {
      await axios.post('http://localhost:5000/api/alerts', {
        type: 'MANUAL_SOS',
        location: location
      });
      setStatus('🚨 SOS Dispatched! Backend is directly calling your trusted contacts via Twilio and emailing live GPS location.');
      setTimeout(() => setStatus(''), 7000);
    } catch (error) {
      console.error(error);
      setStatus('Failed to send SOS. Check network connection.');
    }
  };

  const handleActivateVoice = () => {
    window.dispatchEvent(new CustomEvent('activate-voice'));
  };

  const handleToggleVoice = () => {
    window.dispatchEvent(new CustomEvent('toggle-voice'));
  };

  const simulateCodeWord = (phrase) => {
    window.dispatchEvent(new CustomEvent('simulate-voice-phrase', { detail: { phrase } }));
  };

  const testVoiceOutput = () => {
    speakUltron("Code word detected, activating Ultron.");
  };

  return (
    <div>
      <h1>HOME</h1>
      
      {/* Voice Assistant & Code Word Guard Card */}
      <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>
            <Activity size={20} color="#00d2ff" /> Voice Assistant & Emergency Code Word Guard
          </h3>
          
          <button 
            onClick={testVoiceOutput}
            type="button"
            title="Hear authoritative male AI voice"
            style={{ 
              background: 'rgba(14, 165, 233, 0.15)', 
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8', 
              padding: '6px 14px', 
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px'
            }}
          >
            <Volume2 size={15} /> Test AI Voice Output
          </button>
        </div>

        <p style={{ color: 'rgba(226, 232, 240, 0.85)', marginBottom: '20px', fontSize: '14px', lineHeight: '1.6' }}>
          ULTRON listens locally on your device for distress code words (e.g. <em>"help"</em>, <em>"save me"</em>, <em>"someone is attacking"</em>).
        </p>

        {/* Arc Reactor Voice Assistant Interactive Button with Repelling Energy Field */}
        <div className={`arc-reactor-container ${voiceListening && !permissionBlocked ? 'listening' : 'idle'}`}>
          {/* Concentric Repelling Energy Waves */}
          <div className="repelling-ring ring-1" />
          <div className="repelling-ring ring-2" />
          {voiceListening && !permissionBlocked && <div className="repelling-ring ring-3" />}

          {/* Rotating High-Tech Repulsor Orbit Ring */}
          <div className="reactor-orbit" />

          {/* Central Arc Reactor Interactive Button */}
          <button 
            onClick={handleToggleVoice}
            className={`arc-reactor-core-btn ${
              permissionBlocked ? 'blocked' : voiceListening ? 'listening' : 'muted'
            }`}
            title={permissionBlocked ? 'Click to Grant Microphone Access' : voiceListening ? 'Click to Mute Voice Assistant' : 'Click to Activate Voice Assistant'}
          >
            <img 
              src="/archreactor-logo.png" 
              alt="Arc Reactor Voice Guard" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                filter: permissionBlocked 
                  ? 'grayscale(80%) sepia(80%) hue-rotate(330deg)' 
                  : !voiceListening 
                    ? 'grayscale(40%) opacity(80%)' 
                    : 'drop-shadow(0 0 10px #00d2ff)' 
              }} 
            />
          </button>
        </div>

        {/* Primary Action Button if muted or blocked */}
        {!voiceListening && (
          <div style={{ marginBottom: '16px' }}>
            <button 
              onClick={handleActivateVoice}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '25px',
                fontWeight: '700',
                fontSize: '15px',
                letterSpacing: '0.5px',
                boxShadow: '0 8px 25px rgba(0, 210, 255, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Mic size={18} /> ACTIVATE VOICE GUARD (CLICK HERE)
            </button>
          </div>
        )}

        {/* Live Audio Equalizer & Sound Wave Bars */}
        {voiceListening && !permissionBlocked && (
          <div style={{
            background: 'rgba(6, 14, 30, 0.6)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '12px',
            padding: '14px 20px',
            maxWidth: '460px',
            margin: '0 auto 16px auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
              <span style={{ color: '#00d2ff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={14} /> LIVE MIC AUDIO INPUT
              </span>
              <span style={{ color: micVolume > 15 ? '#00e676' : '#94a3b8', fontWeight: '600' }}>
                {micVolume > 15 ? `Hearing Voice (${micVolume}%)` : `Waiting for speech (${micVolume}%)`}
              </span>
            </div>

            {/* Equalizer Bars */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '32px', gap: '6px' }}>
              {frequencies.map((val, idx) => {
                const barHeight = Math.max(4, Math.round((val / 255) * 32));
                return (
                  <div
                    key={idx}
                    style={{
                      width: '10px',
                      height: `${barHeight}px`,
                      backgroundColor: micVolume > 15 ? '#00d2ff' : '#0284c7',
                      borderRadius: '4px',
                      boxShadow: micVolume > 15 ? '0 0 10px rgba(0, 210, 255, 0.8)' : 'none',
                      transition: 'height 0.08s ease'
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Real-Time Live Status Feedback */}
        <div style={{ marginTop: '10px' }}>
          {permissionBlocked ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 170, 0, 0.15)',
              border: '1px solid rgba(255, 170, 0, 0.4)',
              color: '#ffaa00',
              padding: '8px 18px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <AlertTriangle size={16} />
              <span>Microphone Blocked in Browser — Click button above to grant permission</span>
            </div>
          ) : networkError ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 170, 0, 0.12)',
              border: '1px solid rgba(255, 170, 0, 0.35)',
              color: '#ffaa00',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px'
            }}>
              <AlertTriangle size={14} />
              <span>Cloud Speech Engine Offline. Local Sound Wave Monitor is active. Use test buttons below.</span>
            </div>
          ) : voiceListening ? (
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(0, 210, 255, 0.12)',
                border: '1px solid rgba(0, 210, 255, 0.35)',
                color: '#00d2ff',
                padding: '6px 18px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00d2ff', boxShadow: '0 0 10px #00d2ff', display: 'inline-block' }} />
                <span>🟢 Voice Guard Active — Listening continuously</span>
              </div>

              {voiceTranscript ? (
                <div style={{ marginTop: '12px', fontSize: '15px', color: '#ffffff', background: 'rgba(0, 210, 255, 0.15)', padding: '10px 16px', borderRadius: '10px', display: 'inline-block', border: '1px solid rgba(0, 210, 255, 0.4)' }}>
                  🎙️ Recognized Speech: <strong>"{voiceTranscript}"</strong>
                </div>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                  Speak clearly into your microphone: <em>"Help"</em>, <em>"Save me"</em>, or <em>"Someone is attacking"</em>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              <span>Voice Guard is Muted — Click "Activate Voice Guard" above to start</span>
            </div>
          )}
        </div>

        {/* 1-Click Simulated Voice Chips (Guarantees Testing on any Machine) */}
        <div style={{ marginTop: '22px', borderTop: '1px solid rgba(56, 189, 248, 0.15)', paddingTop: '16px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#00d2ff" /> Test Emergency Code Words (Click to trigger instantly or speak aloud):
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: '🚨 "Help"', phrase: 'help' },
              { label: '🚨 "Save me"', phrase: 'save me' },
              { label: '🚨 "Someone is attacking"', phrase: 'someone is attacking' },
              { label: '💬 "Ultron"', phrase: 'ultron' },
            ].map((item) => (
              <button
                key={item.phrase}
                type="button"
                onClick={() => simulateCodeWord(item.phrase)}
                title={`Simulate saying "${item.phrase}"`}
                style={{
                  fontSize: '12px',
                  background: 'rgba(14, 165, 233, 0.18)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#e0f2fe',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual SOS Trigger Button */}
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <button className="sos-button" onClick={triggerSOS}>
          SOS
        </button>
        {status && <p style={{ color: '#00d2ff', marginTop: '14px', fontSize: '18px', fontWeight: 'bold', textShadow: '0 0 10px rgba(0, 210, 255, 0.5)' }}>{status}</p>}
      </div>

      {/* Live Location Card */}
      <div className="card">
        <h3>Live Location</h3>
        {location ? (
          <div>
            <p style={{ marginBottom: '15px', color: '#e2e8f0' }}>Latitude: {location.lat.toFixed(4)}, Longitude: {location.lng.toFixed(4)}</p>
            <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.25)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.005},${location.lat-0.005},${location.lng+0.005},${location.lat+0.005}&layer=mapnik&marker=${location.lat},${location.lng}`}
                style={{ filter: 'invert(90%) hue-rotate(180deg)' }}
              ></iframe>
            </div>
          </div>
        ) : (
          <p style={{ color: '#94a3b8' }}>Fetching location...</p>
        )}
      </div>
    </div>
  );
}
