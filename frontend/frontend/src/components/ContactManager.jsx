import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { saveCachedContacts, getCachedContacts, isDeviceOnline } from '../utils/offlineStorage';

export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', telegram: '' });
  const [isOffline, setIsOffline] = useState(!isDeviceOnline());

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/contacts');
      setContacts(res.data);
      saveCachedContacts(res.data);
      setIsOffline(false);
    } catch (error) {
      console.warn('[CONTACTS] Network fetch failed, reading from offline cache:', error.message);
      const cached = getCachedContacts();
      setContacts(cached);
      setIsOffline(true);
    }
  };

  const addContact = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/contacts', newContact);
      setNewContact({ name: '', phone: '', email: '', telegram: '' });
      fetchContacts();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteContact = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/contacts/${id}`);
      fetchContacts();
    } catch (error) {
      console.error(error);
    }
  };

  const [callingStatus, setCallingStatus] = useState('');

  const handleCallMeBotCall = async (target, name) => {
    setCallingStatus(`📞 Placing free automated CallMeBot voice call to ${name} (${target})...`);
    try {
      const res = await axios.post('http://localhost:5000/api/callmebot/call', { 
        user: target,
        message: `Hello ${name}. This is an automated safety emergency call from Ultron Assistant.`
      });
      setCallingStatus(`✅ CallMeBot call dispatched! ${name}'s Telegram is ringing now.`);
      setTimeout(() => setCallingStatus(''), 8000);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      setCallingStatus(`⚠️ CallMeBot notice: ${errMsg} (Make sure @CallMeBot_txtbot was started on Telegram)`);
      setTimeout(() => setCallingStatus(''), 12000);
    }
  };

  const handleTwilioCall = async (phone, name) => {
    setCallingStatus(`📞 Placing Twilio carrier call directly to ${name} (${phone})...`);
    try {
      const res = await axios.post('http://localhost:5000/api/twilio/call', { 
        phone,
        message: `Hello ${name}. This is a direct safety call from the Ultron Assistant on behalf of your contact.`
      });
      setCallingStatus(`✅ Twilio call placed! Call SID: ${res.data.callSid}. ${name}'s phone is ringing.`);
      setTimeout(() => setCallingStatus(''), 8000);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      setCallingStatus(`⚠️ Twilio call error: ${errMsg}`);
      setTimeout(() => setCallingStatus(''), 10000);
    }
  };

  return (
    <div>
      <h1>Emergency Contacts</h1>

      {callingStatus && (
        <div style={{
          backgroundColor: callingStatus.startsWith('✅') 
            ? 'rgba(0, 210, 255, 0.15)' 
            : callingStatus.startsWith('📞') 
              ? 'rgba(14, 165, 233, 0.2)' 
              : 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          color: '#ffffff',
          fontWeight: '500',
          fontSize: '14px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          {callingStatus}
        </div>
      )}
      
      <div className="card">
        <h3>Add New Contact</h3>
        <form onSubmit={addContact}>
          <input 
            type="text" 
            placeholder="Name" 
            value={newContact.name} 
            onChange={(e) => setNewContact({...newContact, name: e.target.value})} 
            required 
          />
          <input 
            type="text" 
            placeholder="Phone Number (e.g. +91 8919479770 or 8919479770)" 
            value={newContact.phone} 
            onChange={(e) => setNewContact({...newContact, phone: e.target.value})} 
            required 
          />
          <input 
            type="email" 
            placeholder="Email Address (for real-time live location emails)" 
            value={newContact.email} 
            onChange={(e) => setNewContact({...newContact, email: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="Telegram Username (e.g. @sreesanth or phone - for Free Automated Call)" 
            value={newContact.telegram} 
            onChange={(e) => setNewContact({...newContact, telegram: e.target.value})} 
          />
          <button type="submit">Save Contact</button>
        </form>
      </div>

      <div className="card">
        <h3>Trusted Contacts</h3>
        {contacts.length === 0 ? <p style={{ color: '#94a3b8' }}>No contacts added yet.</p> : null}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {contacts.map(c => (
            <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)' }}>
              <div>
                <strong style={{ fontSize: '18px', color: '#ffffff' }}>{c.name}</strong>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '5px' }}>
                  {c.phone} {c.email ? ` | ${c.email}` : ''} {c.telegram ? ` | Telegram: ${c.telegram}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => handleCallMeBotCall(c.telegram || c.phone, c.name)}
                  title="Automated Hands-Free Voice Call via CallMeBot (100% Free)"
                  style={{ 
                    background: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)', 
                    color: '#ffffff', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: '10px',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 15px rgba(0, 210, 255, 0.35)'
                  }}
                >
                  <Phone size={14} /> Call (CallMeBot)
                </button>
                <a 
                  href={`tel:${c.phone.replace(/[\s\-\(\)]/g, '')}`}
                  title="Direct Cellular Call (Using Phone SIM - 100% Free)"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    color: '#ffffff', 
                    textDecoration: 'none',
                    padding: '8px 16px', 
                    borderRadius: '10px',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <Phone size={14} /> Call (SIM)
                </a>
                <button 
                  type="button" 
                  onClick={() => deleteContact(c.id)} 
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    color: '#fca5a5', 
                    border: '1px solid rgba(239, 68, 68, 0.35)', 
                    padding: '8px 12px',
                    borderRadius: '10px'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* CallMeBot Free Voice Calls Setup Guide */}
      <div className="card" style={{ marginTop: '20px', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <h4 style={{ color: '#00d2ff', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          🤖 Free Automated Voice Calls Setup (CallMeBot):
        </h4>
        <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.6', marginBottom: '10px' }}>
          When you scream <em>"help"</em> or trigger SOS, Ultron automatically places a voice call to your trusted contact's Telegram hands-free:
        </p>
        <ol style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
          <li>Your contact opens Telegram and searches for <strong style={{ color: '#38bdf8' }}>@CallMeBot_txtbot</strong> (or visits <a href="https://t.me/CallMeBot_txtbot" target="_blank" rel="noreferrer" style={{ color: '#00d2ff' }}>t.me/CallMeBot_txtbot</a>).</li>
          <li>They tap <strong>Start</strong> (or send <code>/start</code>) once to authorize the bot.</li>
          <li>Add their Telegram username (e.g. <code>@sreesanth</code>) above. Now Ultron will call their phone automatically without you touching anything!</li>
        </ol>
      </div>
    </div>
  );
}

