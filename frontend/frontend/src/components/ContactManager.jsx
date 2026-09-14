import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { saveCachedContacts, getCachedContacts, isDeviceOnline } from '../utils/offlineStorage';

export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });
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
      setNewContact({ name: '', phone: '', email: '' });
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
                <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '5px' }}>{c.phone} {c.email ? ` | ${c.email}` : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  onClick={() => handleTwilioCall(c.phone, c.name)}
                  title="Directly call contact phone via Twilio backend"
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
                    boxShadow: '0 4px 15px rgba(0, 210, 255, 0.35)'
                  }}
                >
                  <Phone size={14} /> Call (Twilio)
                </button>
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
    </div>
  );
}

