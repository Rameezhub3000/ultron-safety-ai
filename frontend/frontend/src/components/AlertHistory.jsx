import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AlertHistory() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/alerts');
        setAlerts(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAlerts();
    // In a real app, we'd use WebSockets for real-time updates. Polling for prototype.
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Alert History</h1>
      <div className="card">
        {alerts.length === 0 ? <p style={{ color: '#94a3b8' }}>No alerts triggered yet.</p> : null}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {alerts.map(a => (
            <li key={a.id} style={{ padding: '16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  background: 'rgba(14, 165, 233, 0.15)', 
                  border: '1px solid rgba(56, 189, 248, 0.35)', 
                  color: '#00d2ff', 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontWeight: '700', 
                  fontSize: '13px',
                  letterSpacing: '0.5px'
                }}>
                  {a.type}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>{new Date(a.timestamp).toLocaleString()}</span>
              </div>
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#e2e8f0', lineHeight: '1.6' }}>
                <span style={{ color: '#38bdf8', fontWeight: '600' }}>Status:</span> {a.status}
                <br/>
                <span style={{ color: '#38bdf8', fontWeight: '600' }}>Location:</span> {a.location ? a.location : 'Unknown'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
