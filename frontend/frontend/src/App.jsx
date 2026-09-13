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
              <Route path="/privacy" element={<PrivacyShield />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}

export default App;

