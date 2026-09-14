import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// If accessed from mobile phone (via Wi-Fi or tunnel), forward localhost:5000 calls to local proxy
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  axios.interceptors.request.use((config) => {
    if (config.url && config.url.includes('localhost:5000')) {
      config.url = config.url.replace(/http:\/\/localhost:5000/, '');
    }
    return config;
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
