import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Lock, EyeOff, Key, RefreshCw, Trash2, CheckCircle2, Cpu, PhoneCall, AlertTriangle, Check } from 'lucide-react';
import { getKeyFingerprint, encryptData, decryptData, purgeLocalEncryptionData, getOrCreateMasterKey } from '../utils/cryptoService';

export default function PrivacyShield() {
  const [fingerprint, setFingerprint] = useState('Loading...');
  const [testInput, setTestInput] = useState('My secret location or emergency note');
  const [encryptedOutput, setEncryptedOutput] = useState(null);
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Twilio Connection State
  const [twilioStatus, setTwilioStatus] = useState({ configured: false, accountSidMasked: null, phoneNumber: null });
  const [twilioForm, setTwilioForm] = useState({ accountSid: '', authToken: '', phoneNumber: '' });
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [twilioCallFeedback, setTwilioCallFeedback] = useState('');
  const [twilioSaveMessage, setTwilioSaveMessage] = useState('');

  useEffect(() => {
    loadKeyData();
    fetchTwilioStatus();
  }, []);

  const fetchTwilioStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/twilio/status');
      setTwilioStatus(res.data);
    } catch (err) {
      console.warn('Could not fetch Twilio status:', err.message);
    }
  };

  const handleSaveTwilio = async (e) => {
    e.preventDefault();
    setTwilioSaveMessage('Saving Twilio credentials...');
    try {
      const res = await axios.post('http://localhost:5000/api/twilio/config', twilioForm);
      setTwilioSaveMessage('✅ ' + res.data.message);
      fetchTwilioStatus();
      setTimeout(() => setTwilioSaveMessage(''), 6000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setTwilioSaveMessage('❌ Failed: ' + msg);
    }
  };

  const handleDirectTwilioCall = async () => {
    if (!testPhoneNumber) return;
    setTwilioCallFeedback(`📞 Dialing ${testPhoneNumber} via Twilio Voice API...`);
    try {
      const res = await axios.post('http://localhost:5000/api/twilio/call', {
        phone: testPhoneNumber,
        message: 'This is an emergency test call from the Ultron AI Safety Assistant. Twilio carrier connection is verified and operational.'
      });
      setTwilioCallFeedback(`✅ Call Dispatched! Call SID: ${res.data.callSid}. Your phone is ringing!`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setTwilioCallFeedback(`❌ Call Failed: ${msg}`);
    }
  };

  const loadKeyData = async () => {
    await getOrCreateMasterKey();
    const fp = await getKeyFingerprint();
    setFingerprint(fp);
  };

  const handleTestEncrypt = async () => {
    if (!testInput) return;
    const result = await encryptData(testInput);
    setEncryptedOutput(result);
    const decrypted = await decryptData(result.ciphertext, result.iv);
    setDecryptedOutput(decrypted);
  };

  const handlePurge = () => {
    if (window.confirm('Are you sure you want to purge your encryption key and local cache? A new key will be generated.')) {
      purgeLocalEncryptionData();
      setEncryptedOutput(null);
      setDecryptedOutput('');
      setStatusMessage('Local key purged. Generating new cryptographic key...');
      loadKeyData().then(() => {
        setTimeout(() => setStatusMessage(''), 3000);
      });
    }
  };

  return (
    <div>
      <h1>Privacy & Security Shield</h1>
      
      {/* 1. On-Device Voice Privacy Guarantee */}
      <div className="card" style={{ borderLeft: '4px solid #00d2ff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <EyeOff size={28} color="#00d2ff" />
          <h3 style={{ margin: 0, color: '#ffffff' }}>Zero-Eavesdropping Voice Guarantee</h3>
        </div>
        <p style={{ color: 'rgba(226, 232, 240, 0.85)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 14px 0' }}>
          ULTRON respects your absolute privacy. Microphone monitoring and distress code word detection (e.g. <em>"help"</em>, <em>"save me"</em>, <em>"someone is attacking"</em>) are performed <strong>100% locally on your device</strong> using browser Web Speech APIs.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ color: '#00d2ff', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> No Audio Uploaded
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Ambient room audio is never recorded, streamed, or stored on remote servers.
            </div>
          </div>
          <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ color: '#00d2ff', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={16} /> On-Device Processing
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Pattern matching runs directly on your local device CPU.
            </div>
          </div>
        </div>
      </div>

      {/* 2. AES-256-GCM End-to-End Cryptography */}
      <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Lock size={28} color="#38bdf8" />
          <h3 style={{ margin: 0, color: '#ffffff' }}>End-to-End Encryption (AES-256-GCM)</h3>
        </div>
        <p style={{ color: 'rgba(226, 232, 240, 0.85)', fontSize: '14px', lineHeight: '1.7' }}>
          All sensitive user data, emergency contacts, and distress logs are guarded by military-grade <strong>AES-256-GCM</strong> authenticated encryption via the browser's native Web Crypto API.
        </p>

        <div style={{ background: 'rgba(6, 14, 30, 0.6)', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Master Key Fingerprint:</span>
              <div style={{ fontFamily: 'monospace', color: '#00d2ff', fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>
                SHA-256: {fingerprint}
              </div>
            </div>
            <button 
              onClick={handlePurge}
              style={{
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '13px'
              }}
            >
              <Trash2 size={14} /> Purge / Rotate Key
            </button>
          </div>
          {statusMessage && <p style={{ color: '#38bdf8', fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>{statusMessage}</p>}
        </div>

        {/* Live Cryptographic Verification Tool */}
        <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '10px' }}>Verify Encryption In Real-Time:</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            type="text" 
            value={testInput} 
            onChange={(e) => setTestInput(e.target.value)} 
            placeholder="Type confidential note..."
            style={{ margin: 0, flex: 1 }}
          />
          <button onClick={handleTestEncrypt} style={{ whiteSpace: 'nowrap' }}>
            Encrypt Payload
          </button>
        </div>

        {encryptedOutput && (
          <div style={{ background: 'rgba(6, 14, 30, 0.7)', padding: '15px', borderRadius: '10px', fontSize: '13px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ color: '#94a3b8', marginBottom: '4px' }}><strong>Encrypted Ciphertext (Base64):</strong></div>
            <div style={{ fontFamily: 'monospace', color: '#00d2ff', wordBreak: 'break-all', marginBottom: '10px' }}>
              {encryptedOutput.ciphertext}
            </div>
            <div style={{ color: '#94a3b8', marginBottom: '4px' }}><strong>Initialization Vector (IV):</strong></div>
            <div style={{ fontFamily: 'monospace', color: '#64748b', wordBreak: 'break-all', marginBottom: '10px' }}>
              {encryptedOutput.iv}
            </div>
            <div style={{ color: '#38bdf8', borderTop: '1px solid rgba(56, 189, 248, 0.15)', paddingTop: '8px' }}>
              <strong>Decrypted Output:</strong> "{decryptedOutput}"
            </div>
          </div>
        )}
      </div>

      {/* 3. Live Twilio Carrier Phone Call Connection */}
      <div className="card" style={{ borderLeft: '4px solid #00d2ff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PhoneCall size={28} color="#00d2ff" />
            <h3 style={{ margin: 0, color: '#ffffff' }}>Twilio Direct Phone Calling Setup</h3>
          </div>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: twilioStatus.configured ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 170, 0, 0.15)',
            color: twilioStatus.configured ? '#38bdf8' : '#ffaa00',
            border: twilioStatus.configured ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(255, 170, 0, 0.3)'
          }}>
            {twilioStatus.configured ? `Active (${twilioStatus.phoneNumber})` : 'Action Required: Add Keys'}
          </span>
        </div>

        <p style={{ color: 'rgba(226, 232, 240, 0.85)', fontSize: '14px', lineHeight: '1.6' }}>
          To place real automated carrier phone calls directly to your contacts' phones, connect your Twilio account below.
          Once saved, the backend directly places calls without requiring your local browser to dial.
        </p>

        {/* Credentials Form */}
        <form onSubmit={handleSaveTwilio} style={{ background: 'rgba(6, 14, 30, 0.7)', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <h4 style={{ margin: '0 0 14px 0', color: '#ffffff', fontSize: '14px' }}>Twilio API Credentials:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Account SID:</label>
              <input 
                type="text" 
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                value={twilioForm.accountSid} 
                onChange={(e) => setTwilioForm({...twilioForm, accountSid: e.target.value})} 
                required 
                style={{ margin: 0, fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Auth Token:</label>
              <input 
                type="password" 
                placeholder="Your Twilio Auth Token" 
                value={twilioForm.authToken} 
                onChange={(e) => setTwilioForm({...twilioForm, authToken: e.target.value})} 
                required 
                style={{ margin: 0, fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Twilio Phone Number:</label>
              <input 
                type="text" 
                placeholder="+1xxxxxxxxxx" 
                value={twilioForm.phoneNumber} 
                onChange={(e) => setTwilioForm({...twilioForm, phoneNumber: e.target.value})} 
                required 
                style={{ margin: 0, fontFamily: 'monospace' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button type="submit" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)', border: 'none', boxShadow: '0 4px 15px rgba(0, 210, 255, 0.35)' }}>
              Connect & Save Twilio Keys
            </button>
            {twilioSaveMessage && (
              <span style={{ fontSize: '13px', color: twilioSaveMessage.startsWith('✅') ? '#38bdf8' : '#f87171', fontWeight: '500' }}>
                {twilioSaveMessage}
              </span>
            )}
          </div>
        </form>

        {/* Live Test Call Tool */}
        <div style={{ background: 'rgba(6, 14, 30, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.18)' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#ffffff', fontSize: '14px' }}>Test Live Phone Call (Direct Ring):</h4>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' }}>
            Enter your mobile number with country code (e.g. <code>+91 8919479770</code>) to verify that Twilio rings your phone right now:
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="+91 8919479770" 
              value={testPhoneNumber} 
              onChange={(e) => setTestPhoneNumber(e.target.value)} 
              style={{ margin: 0, flex: 1, minWidth: '220px' }}
            />
            <button 
              type="button" 
              onClick={handleDirectTwilioCall}
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(0, 210, 255, 0.35)' }}
            >
              <PhoneCall size={16} /> Call My Phone Now
            </button>
          </div>
          {twilioCallFeedback && (
            <div style={{ 
              marginTop: '12px', 
              padding: '10px 14px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              backgroundColor: twilioCallFeedback.startsWith('✅') ? 'rgba(0, 210, 255, 0.15)' : twilioCallFeedback.startsWith('📞') ? 'rgba(14, 165, 233, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#ffffff' 
            }}>
              {twilioCallFeedback}
            </div>
          )}
        </div>
      </div>

      {/* 4. Multi-Channel Dispatch Channels */}
      <div className="card">
        <h3>Multi-Channel Dispatch Channels</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6' }}>
          When an emergency trigger occurs, ULTRON deploys a three-pronged distress broadcast:
        </p>
        <ul style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.8', marginLeft: '20px' }}>
          <li><strong>Twilio Voice Call:</strong> Places automated carrier phone calls with custom speech synthesis directly alerting your trusted contacts.</li>
          <li><strong>Real-Time Location Email:</strong> Transmits live Google Maps links and GPS coordinates to contact inboxes via Nodemailer.</li>
          <li><strong>Native Phone Dialer:</strong> Activates your local phone dialer as an instant offline backup if no network is available.</li>
        </ul>
      </div>
    </div>
  );
}

