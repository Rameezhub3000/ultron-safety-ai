# 🚨 ULTRON | Tactical AI Emergency Safety Assistant

<div align="center">
  <img src="frontend/frontend/public/archreactor-logo.png" alt="ULTRON Arc Reactor" width="120" height="120" />
  <h3>Tactical Personal Safety Guard with Hands-Free Voice Distress Detection</h3>
  <p>Offline-First PWA • Automated Twilio Voice Calls • Live GPS Location Emails • AES-256 E2EE</p>
</div>

---

## ⚡ Core Features

- **🎙️ Hands-Free Emergency Voice Distress Recognition**:
  - Continuous on-device monitoring for critical emergency code words: `"help"`, `"save me"`, `"someone is attacking"`, `"call police"`, `"sos"`.
  - **Self-Voice Echo Immunity**: Prevents looping by dropping speaker audio and implementing a post-speech silence buffer.
  - Multi-turn rolling speech buffer with alternative candidate evaluation.
- **📞 Automated Twilio Emergency Calls**:
  - Dispatches carrier-grade voice phone calls to your trusted emergency contacts with spoken incident alerts and coordinates.
- **📍 Real-Time GPS Location Dispatch**:
  - Automatically transmits real-time Google Maps coordinates via Nodemailer alerts to trusted emergency contacts.
- **🔋 Offline-First PWA Architecture**:
  - Service Worker offline caching and LocalStorage queues.
  - Instant native cellular emergency fallback (`tel:`) when internet or cellular data is unavailable.
- **🔒 Zero-Audio Cloud Upload & E2EE**:
  - Voice processing is 100% on-device using browser Web Speech & Web Audio APIs.
  - Room audio is never recorded, never streamed, and never sent to cloud servers.
  - Client-side AES-256-GCM note and data encryption.
- **⚛️ Cyber Arc Reactor UI**:
  - Cool blue and crisp white aesthetic with live audio equalizer bars and radiating repelling energy field animations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router, Lucide Icons, Web Audio API, Web Speech API, Service Workers (PWA)
- **Backend**: Node.js, Express, SQLite3, Twilio SDK, Nodemailer, Axios, CORS

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Clone the Repository
```bash
git clone https://github.com/<YOUR-USERNAME>/ultron-safety-ai.git
cd ultron-safety-ai
```

### 3. Setup Backend
```bash
cd backend/backend
npm install
cp .env.example .env
# Edit .env with your Twilio credentials (optional for testing)
node server.js
```

### 4. Setup Frontend
In a new terminal:
```bash
cd frontend/frontend
npm install
npm run dev
```

Open **[http://localhost:5173/](http://localhost:5173/)** in Chrome or Edge.

---

## ⚙️ Configuration (`.env`)

In `backend/backend/.env`:
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```
*(High-fidelity simulation mode is automatically active if credentials are left blank).*

---

## 🛡️ Privacy & Security
ULTRON is engineered with a strict privacy-first principle. Ambient audio stays local to your device. Only emergency dispatches (when a distress code word is spoken or manual SOS is tapped) transmit alert data to your configured trusted contacts.
