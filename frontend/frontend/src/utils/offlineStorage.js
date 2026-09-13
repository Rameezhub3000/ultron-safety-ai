// ULTRON Offline Persistence & Auto-Sync Engine
import axios from 'axios';

const CONTACTS_CACHE_KEY = 'ultron_cached_contacts';
const OFFLINE_ALERTS_QUEUE_KEY = 'ultron_offline_alerts_queue';

// Check if device currently has internet access
export function isDeviceOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Cache contacts locally so they are accessible with zero internet
export function saveCachedContacts(contacts) {
  try {
    localStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.warn('[OFFLINE STORAGE] Failed to cache contacts:', err);
  }
}

export function getCachedContacts() {
  try {
    const raw = localStorage.getItem(CONTACTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[OFFLINE STORAGE] Failed to read cached contacts:', err);
    return [];
  }
}

// Queue an alert when triggered in offline mode
export function queueOfflineAlert(alertData) {
  try {
    const existing = getQueuedAlerts();
    const queuedItem = {
      ...alertData,
      queuedAt: new Date().toISOString(),
      offline: true
    };
    existing.push(queuedItem);
    localStorage.setItem(OFFLINE_ALERTS_QUEUE_KEY, JSON.stringify(existing));
    console.log('[OFFLINE STORAGE] ⚠️ Alert queued locally for background sync:', queuedItem);
    return queuedItem;
  } catch (err) {
    console.warn('[OFFLINE STORAGE] Failed to queue offline alert:', err);
    return alertData;
  }
}

export function getQueuedAlerts() {
  try {
    const raw = localStorage.getItem(OFFLINE_ALERTS_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function clearQueuedAlerts() {
  try {
    localStorage.removeItem(OFFLINE_ALERTS_QUEUE_KEY);
  } catch {}
}

// Automatically sync pending offline alerts once internet connection resumes
export async function syncPendingAlerts() {
  if (!isDeviceOnline()) return;

  const queue = getQueuedAlerts();
  if (queue.length === 0) return;

  console.log(`[OFFLINE STORAGE] 🔄 Reconnected! Syncing ${queue.length} pending alert(s) to server...`);

  const remaining = [];
  for (const alert of queue) {
    try {
      await axios.post('http://localhost:5000/api/alerts', {
        type: `${alert.type} [OFFLINE_SYNCED]`,
        location: alert.location
      });
      console.log('[OFFLINE STORAGE] ✅ Offline alert successfully synced to server:', alert.id);
    } catch (err) {
      console.warn('[OFFLINE STORAGE] Could not sync alert, keeping in queue:', err.message);
      remaining.push(alert);
    }
  }

  if (remaining.length === 0) {
    clearQueuedAlerts();
    window.dispatchEvent(new CustomEvent('ultron-offline-sync-complete'));
  } else {
    localStorage.setItem(OFFLINE_ALERTS_QUEUE_KEY, JSON.stringify(remaining));
  }
}

// Auto-sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[ULTRON] Device is back online. Initiating auto-sync.');
    syncPendingAlerts();
  });
}
