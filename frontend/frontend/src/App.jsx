import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Wifi, WifiOff, Shield } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ContactManager from './components/ContactManager';
import AlertHistory from './components/AlertHistory';
import ChatInterface from './components/ChatInterface';
import VoiceController from './components/VoiceController';
import Protocols from './components/Protocols';
import PrivacyShield from './components/PrivacyShield';
import ErrorBoundary from './components/ErrorBoundary';
import { isDeviceOnline, syncPendingAlerts } from './utils/offlineStorage';
import './App.css';

import { getPrivacyPassword } from './utils/offlineStorage';

function ProtectedPrivacyShield() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const activeMasterPassword = getPrivacyPassword();
    if (passwordInput.trim() === activeMasterPassword.trim()) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('❌ Incorrect Master Password. Access Denied.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '32px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.35)', boxShadow: '0 15px 40px rgba(0, 210, 255, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '50%', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
              <Shield size={36} color="#00d2ff" />
            </div>
          </div>
          
          <h2 style={{ margin: '0 0 8px 0', color: '#00d2ff' }}>Privacy & Security Gate</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
            This section contains encrypted keys and security settings. Enter master password to proceed:
          </p>

          <form onSubmit={handlePasswordSubmit}>
            <input 
              type="password" 
              placeholder="Enter Master Password" 
              value={passwordInput} 
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setAuthError('');
              }}
              autoFocus
              required
              style={{ width: '100%', padding: '12px 16px', fontSize: '15px', textAlign: 'center', marginBottom: '12px' }}
            />

            {authError && (
              <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '14px', fontWeight: '500' }}>
                {authError}
              </div>
            )}

            <button 
              type="submit" 
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)', border: 'none', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 15px rgba(0, 210, 255, 0.4)' }}
            >
              Unlock Privacy & Security
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <PrivacyShield />;
}

function App() {
  const [online, setOnline] = useState(isDeviceOnline());

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      syncPendingAlerts();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    syncPendingAlerts();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <VoiceController /> {/* Global Voice Controller */}
        
        <nav className="sidebar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
            <img 
              src="/archreactor-logo.png" 
              alt="Arc Reactor Logo" 
              style={{ 
                height: '46px', 
                width: '46px',
                marginRight: '12px', 
                borderRadius: '50%',
                boxShadow: '0 0 20px rgba(0, 210, 255, 0.75)',
                border: '2px solid rgba(0, 210, 255, 0.5)'
              }} 
            />
            <h2 style={{ margin: 0 }}>ULTRON</h2>
          </div>

          {/* Network Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '20px',
            backgroundColor: online ? 'rgba(0, 210, 255, 0.12)' : 'rgba(255, 170, 0, 0.15)',
            border: online ? '1px solid rgba(0, 210, 255, 0.35)' : '1px solid rgba(255, 170, 0, 0.4)',
            marginBottom: '25px',
            fontSize: '12px',
            fontWeight: '600',
            color: online ? '#38bdf8' : '#ffaa00'
          }}>
            {online ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{online ? 'Online & Synced' : 'Offline Guard Active'}</span>
          </div>

          <ul>
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/protocols">Protocols</Link></li>
            <li><Link to="/contacts">Contacts</Link></li>
            <li><Link to="/history">Alert History</Link></li>
            <li><Link to="/chat">AI Safety Chat</Link></li>
            <li><Link to="/privacy" style={{ color: '#38bdf8' }}>Privacy & Security</Link></li>
          </ul>

          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(56, 189, 248, 0.15)', fontSize: '11px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.6' }}>
            🔒 AES-256 E2EE Protected<br /><span style={{ color: '#38bdf8' }}>Zero-Audio Upload</span> Verified
          </div>
        </nav>

        <main className="content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/protocols" element={<Protocols />} />
              <Route path="/contacts" element={<ContactManager />} />
              <Route path="/history" element={<AlertHistory />} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/privacy" element={<ProtectedPrivacyShield />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}

export default App;

