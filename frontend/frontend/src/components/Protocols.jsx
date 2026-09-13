import React from 'react';

export default function Protocols() {
  return (
    <div>
      <h1>SAFETY PROTOCOLS</h1>
      
      <div className="card">
        <h3 style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '12px', color: '#00d2ff' }}>PROTOCOL ALPHA: ACTIVE THREAT / ATTACK</h3>
        <ul style={{ listStyleType: 'disc', color: 'rgba(226, 232, 240, 0.85)', lineHeight: '1.8', marginLeft: '20px' }}>
          <li><strong style={{ color: '#ffffff' }}>RUN:</strong> Escape the area if possible. Leave belongings behind. Keep your hands visible.</li>
          <li><strong style={{ color: '#ffffff' }}>HIDE:</strong> If escape is impossible, find a secure hiding spot. Lock and barricade doors. Silence your phone.</li>
          <li><strong style={{ color: '#ffffff' }}>FIGHT:</strong> As an absolute last resort, commit to your actions. Act with physical aggression.</li>
          <li><strong style={{ color: '#38bdf8' }}>TRIGGER ULTRON:</strong> Shout your SOS code word or press the SOS button to silently dispatch your location.</li>
        </ul>
      </div>

      <div className="card">
        <h3 style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '12px', color: '#00d2ff' }}>PROTOCOL BETA: BEING FOLLOWED</h3>
        <ul style={{ listStyleType: 'disc', color: 'rgba(226, 232, 240, 0.85)', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Do not go home. Do not lead them to your residence.</li>
          <li>Cross the street multiple times to confirm you are being followed.</li>
          <li>Head immediately to a well-lit, crowded public area (cafes, stores).</li>
          <li>Activate ULTRON's Live Location tracking and keep your phone accessible.</li>
        </ul>
      </div>

      <div className="card">
        <h3 style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '12px', color: '#00d2ff' }}>PROTOCOL GAMMA: GENERAL STREET SAFETY</h3>
        <ul style={{ listStyleType: 'disc', color: 'rgba(226, 232, 240, 0.85)', lineHeight: '1.8', marginLeft: '20px' }}>
          <li><strong style={{ color: '#ffffff' }}>SITUATIONAL AWARENESS:</strong> Keep your head up. Avoid looking down at your phone for extended periods while walking alone.</li>
          <li><strong style={{ color: '#ffffff' }}>AUDIO:</strong> If wearing headphones, keep volume low enough to hear footsteps, or leave one ear uncovered.</li>
          <li><strong style={{ color: '#ffffff' }}>KEYS:</strong> Have your keys ready in your hand before you reach your car or front door.</li>
          <li><strong style={{ color: '#ffffff' }}>TRUST GUT INSTINCTS:</strong> If a situation or person feels wrong, leave immediately. Do not worry about being polite.</li>
        </ul>
      </div>
    </div>
  );
}
